import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(value: number, opts?: { decimals?: number; sign?: boolean }): string {
  const decimals = opts?.decimals ?? 1;
  const sign = opts?.sign ?? true;
  const formatted = value.toFixed(decimals);
  if (!sign) return `${formatted}%`;
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

export function formatBps(value: number): string {
  const formatted = value.toFixed(0);
  return value > 0 ? `+${formatted}bp` : `${formatted}bp`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function relativeYears(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const years = (now - then) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) return "this year";
  if (years < 1.5) return "1 year ago";
  return `${Math.round(years)} years ago`;
}

export function returnTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0.1) return "positive";
  if (value < -0.1) return "negative";
  return "neutral";
}
