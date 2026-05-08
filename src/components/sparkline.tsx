"use client";

import * as React from "react";
import { Group } from "@visx/group";
import { LinePath, Circle } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { curveMonotoneX } from "@visx/curve";
import { cn } from "@/lib/utils";

interface SparklineProps {
  values: Array<number | null>;
  width?: number;
  height?: number;
  className?: string;
  /** Visual treatment based on the last value's sign. */
  toneByLast?: boolean;
  /** Optional explicit tone override. */
  tone?: "positive" | "negative" | "neutral" | "accent";
  /** Show the last point. */
  showEndpoint?: boolean;
  /** Render a baseline at zero, if zero is in range. */
  showBaseline?: boolean;
  strokeWidth?: number;
  /** Optional human-readable labels per point (used for the hover title). */
  labels?: Array<string>;
  /** Unit hint for the hover label ("pct", "bps", "level"). */
  unit?: "pct" | "bps" | "level";
  /** Accessible series name, e.g. "S&P 500". */
  ariaLabel?: string;
}

/**
 * Tufte-style inline sparkline. Hover reveals the exact value at each
 * point — drops the previous aria-hidden so screen readers receive an
 * announceable summary, and adds a desktop hover-tooltip via SVG title
 * elements per point.
 */
export function Sparkline({
  values,
  width = 80,
  height = 22,
  className,
  toneByLast = true,
  tone,
  showEndpoint = true,
  showBaseline = false,
  strokeWidth = 1.25,
  labels,
  unit = "pct",
  ariaLabel,
}: SparklineProps) {
  const data = values
    .map((v, i) => ({ x: i, y: v, label: labels?.[i] }))
    .filter((d): d is { x: number; y: number; label: string | undefined } =>
      d.y !== null && Number.isFinite(d.y),
    );

  if (data.length < 2) {
    return (
      <div
        className={cn("inline-block", className)}
        style={{ width, height }}
        role="img"
        aria-label={ariaLabel ?? "sparkline (insufficient data)"}
      />
    );
  }

  const ys = data.map((d) => d.y);
  const xs = data.map((d) => d.x);
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 0);
  const yPad = Math.max((yMax - yMin) * 0.12, 0.2);

  const xScale = scaleLinear<number>({
    domain: [Math.min(...xs), Math.max(...xs)],
    range: [1, width - 1],
  });
  const yScale = scaleLinear<number>({
    domain: [yMin - yPad, yMax + yPad],
    range: [height - 1, 1],
  });

  const last = data[data.length - 1];

  const chosenTone =
    tone ??
    (toneByLast ? (last.y > 0 ? "positive" : last.y < 0 ? "negative" : "neutral") : "neutral");

  const stroke =
    chosenTone === "positive"
      ? "var(--color-positive)"
      : chosenTone === "negative"
        ? "var(--color-negative)"
        : chosenTone === "accent"
          ? "var(--color-accent)"
          : "var(--color-muted-foreground)";

  // Build a textual summary for screen-readers and the SVG <title>.
  const seriesSummary = (() => {
    const fmt = (n: number) => formatValue(n, unit);
    const minIdx = ys.indexOf(Math.min(...ys));
    const maxIdx = ys.indexOf(Math.max(...ys));
    const minLabel = labels?.[minIdx] ?? `point ${minIdx + 1}`;
    const maxLabel = labels?.[maxIdx] ?? `point ${maxIdx + 1}`;
    const lastLabel = labels?.[data.length - 1] ?? `last`;
    return `${ariaLabel ?? "series"}: low ${fmt(ys[minIdx])} at ${minLabel}, high ${fmt(ys[maxIdx])} at ${maxLabel}, ${fmt(last.y)} at ${lastLabel}`;
  })();

  return (
    <svg
      width={width}
      height={height}
      className={cn("inline-block align-middle", className)}
      role="img"
      aria-label={seriesSummary}
    >
      <title>{seriesSummary}</title>
      <Group>
        {showBaseline && yMin <= 0 && yMax >= 0 ? (
          <line
            x1={1}
            x2={width - 1}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke="var(--color-border-subtle)"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
        ) : null}
        <LinePath
          data={data}
          x={(d) => xScale(d.x)}
          y={(d) => yScale(d.y)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          curve={curveMonotoneX}
        />
        {/* Per-point hover hit-targets: nearly invisible but interactive. */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={Math.max(3, height / 4)}
              fill="transparent"
              stroke="transparent"
              style={{ cursor: "default" }}
            >
              <title>
                {(d.label ?? `point ${i + 1}`)}: {formatValue(d.y, unit)}
              </title>
            </circle>
          </g>
        ))}
        {showEndpoint ? (
          <Circle
            cx={xScale(last.x)}
            cy={yScale(last.y)}
            r={1.6}
            fill={stroke}
          />
        ) : null}
      </Group>
    </svg>
  );
}

function formatValue(n: number, unit: "pct" | "bps" | "level"): string {
  if (unit === "bps") {
    return n > 0 ? `+${n.toFixed(0)}bp` : `${n.toFixed(0)}bp`;
  }
  if (unit === "level") {
    return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
  }
  return n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
}
