import Link from "next/link";
import { Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Logo className="h-5 w-5" />
            <span>OTI</span>
            <Badge variant="outline" className="ml-1 hidden sm:inline-flex">
              v0.1
            </Badge>
          </Link>
          <nav className="hidden items-center gap-5 text-xs text-[var(--color-muted-foreground)] md:flex">
            <Link
              href="/today"
              className="hover:text-[var(--color-foreground)] transition-colors flex items-center gap-1.5"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
              Today
            </Link>
            <Link
              href="/methodology"
              className="hover:text-[var(--color-foreground)] transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/examples"
              className="hover:text-[var(--color-foreground)] transition-colors"
            >
              Examples
            </Link>
            <Link
              href="/dataset"
              className="hover:text-[var(--color-foreground)] transition-colors"
            >
              Dataset
            </Link>
            <Link
              href="/api"
              className="hover:text-[var(--color-foreground)] transition-colors"
            >
              API
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Al033/OTI"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 12 Q 8 6, 12 12 T 20 12"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}
