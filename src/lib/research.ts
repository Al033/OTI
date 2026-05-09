/**
 * Filesystem-backed research-essay loader. Each essay is a Markdown file
 * in /content/research/<date>-<slug>.md with YAML front-matter.
 *
 * No MDX runtime, no @next/mdx — pure markdown rendered server-side via
 * a tiny in-house renderer. The essays are deliberate long-form prose
 * and we want the raw text to live in git, diff-able, citable, and
 * publishable to Substack with one copy-paste.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ResearchEssay {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  substackUrl?: string;
  tags: string[];
  readingMinutes: number;
  featured?: boolean;
  /** The raw markdown body (post-frontmatter). */
  body: string;
}

const RESEARCH_DIR = join(process.cwd(), "content", "research");

let _cached: ResearchEssay[] | null = null;

export function getResearchEssays(): ResearchEssay[] {
  if (_cached) return _cached;
  if (!existsSync(RESEARCH_DIR)) {
    _cached = [];
    return _cached;
  }
  const files = readdirSync(RESEARCH_DIR).filter((f) => f.endsWith(".md"));
  const essays: ResearchEssay[] = [];
  for (const file of files) {
    const path = join(RESEARCH_DIR, file);
    if (!statSync(path).isFile()) continue;
    const text = readFileSync(path, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) {
      console.warn(`[research] skipped ${file}: no frontmatter`);
      continue;
    }
    essays.push(parsed);
  }
  essays.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  _cached = essays;
  return essays;
}

export function getEssayBySlug(slug: string): ResearchEssay | null {
  return getResearchEssays().find((e) => e.slug === slug) ?? null;
}

function parseFrontmatter(raw: string): ResearchEssay | null {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const yaml = m[1];
  const body = m[2].trim();

  const data: Record<string, string | string[] | boolean | number> = {};
  for (const line of yaml.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else if (/^\d+$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = value.replace(/^"|"$/g, "");
    }
  }
  if (!data.slug || !data.title) return null;
  return {
    slug: String(data.slug),
    title: String(data.title),
    description: String(data.description ?? ""),
    publishedAt: String(data.publishedAt ?? ""),
    substackUrl: data.substackUrl ? String(data.substackUrl) : undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingMinutes: typeof data.readingMinutes === "number" ? data.readingMinutes : 8,
    featured: typeof data.featured === "boolean" ? data.featured : undefined,
    body,
  };
}

/**
 * Tiny markdown renderer — handles ATX headings, paragraphs,
 * blockquotes, ordered/unordered lists, fenced code, inline code,
 * links, bold, italic. Deliberate subset to keep the essays portable
 * to Substack via copy-paste.
 *
 * Returns an array of HTML-string blocks; React renders via
 * dangerouslySetInnerHTML on each. Markdown safety: we escape user-
 * supplied content (none here — content is hand-written), but escape
 * regardless to be defensive against future contributor PRs.
 */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip the closing fence
      blocks.push(
        `<pre class="research-code"><code data-lang="${escapeHtml(lang)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      blocks.push(`<h${level}>${renderInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push(`<blockquote><p>${renderInline(quoteLines.join(" "))}</p></blockquote>`);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+]\s/)) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Markdown-style table — basic | header | row | support
    if (line.startsWith("| ")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(tableLines));
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      blocks.push("<hr>");
      i += 1;
      continue;
    }

    // Paragraph (consume until blank line)
    if (line.trim().length > 0) {
      const paraLines: string[] = [];
      while (i < lines.length && lines[i].trim().length > 0 && !isBlockStart(lines[i])) {
        paraLines.push(lines[i]);
        i += 1;
      }
      blocks.push(`<p>${renderInline(paraLines.join(" "))}</p>`);
      continue;
    }

    i += 1; // skip blank line
  }

  return blocks.join("\n");
}

function isBlockStart(line: string): boolean {
  return (
    line.startsWith("#") ||
    line.startsWith("> ") ||
    line.startsWith("```") ||
    line.match(/^[-*+]\s/) !== null ||
    line.match(/^\d+\.\s/) !== null ||
    line.startsWith("|") ||
    line.match(/^---+$/) !== null
  );
}

function renderInline(text: string): string {
  let s = escapeHtml(text);
  // Code spans
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links: [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, t, url) =>
      `<a href="${url}" target="_blank" rel="noreferrer noopener">${t}</a>`,
  );
  // Bold
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic (single asterisk, single underscore)
  s = s.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3");
  return s;
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return "";
  const rows = lines.map((l) =>
    l
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim()),
  );
  // Skip the separator row (--- | --- ...)
  const isSep = (r: string[]) => r.every((c) => /^:?-+:?$/.test(c));
  const header = rows[0];
  const body = rows.slice(1).filter((r) => !isSep(r));
  const thead = `<thead><tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${body
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody>`;
  return `<table class="research-table">${thead}${tbody}</table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
