"use client";

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
}

/**
 * Tufte-style inline sparkline. No axes, no labels, no chart junk.
 * Accepts nulls in the series; they are skipped, leaving a connected
 * line through the present points only.
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
}: SparklineProps) {
  const data = values
    .map((v, i) => ({ x: i, y: v }))
    .filter((d): d is { x: number; y: number } => d.y !== null && Number.isFinite(d.y));

  if (data.length < 2) {
    return (
      <div
        className={cn("inline-block", className)}
        style={{ width, height }}
        aria-hidden
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

  return (
    <svg
      width={width}
      height={height}
      className={cn("inline-block align-middle", className)}
      role="img"
      aria-hidden
    >
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
