"use client";

import * as React from "react";
import { Check, Link2, Twitter, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
  title: string;
  substackUrl?: string;
}

export function ResearchShareBar({ slug, title, substackUrl }: Props) {
  const [copied, setCopied] = React.useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/research/${slug}`
      : null;

  function copyLink() {
    if (!url) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Couldn't copy link"));
  }

  function tweet() {
    if (!url) return;
    const text = `${title}\n\nvia OTI`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function bsky() {
    if (!url) return;
    const text = `${title}\n\nvia OTI — ${url}`;
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="mb-10 flex flex-wrap items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={copyLink} disabled={!url} className="gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button variant="outline" size="sm" onClick={tweet} disabled={!url} className="gap-1.5">
        <Twitter className="h-3.5 w-3.5" />
        Post on X
      </Button>
      <Button variant="outline" size="sm" onClick={bsky} disabled={!url} className="gap-1.5">
        Post on Bluesky
      </Button>
      {substackUrl && (
        <a
          href={substackUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          Substack
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
