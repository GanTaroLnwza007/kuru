"use client";

import { useEffect, useState } from "react";
import { RIASEC_DIMS, type RiasecScores, type RiasecDim } from "@/lib/riasec";

type Props = {
  scores: RiasecScores;
  size?: number;
};

export function RadarChart({ scores, size = 280 }: Props) {
  const dims: RiasecDim[] = ["R", "I", "A", "S", "E", "C"];
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();
    const duration = 900;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const angle = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const point = (i: number, v: number): [number, number] => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * (v / 100), cy + Math.sin(a) * r * (v / 100)];
  };

  const shapePath = dims
    .map((d, i) => {
      const [x, y] = point(i, scores[d] * progress);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {/* Grid polygons */}
      {[20, 40, 60, 80, 100].map((g) => (
        <polygon
          key={g}
          points={dims
            .map((_, i) => {
              const [x, y] = point(i, g);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {dims.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x.toFixed(2)}
            y2={y.toFixed(2)}
            stroke="var(--line-soft)"
            strokeWidth="1"
          />
        );
      })}
      {/* Filled shape */}
      <path
        d={shapePath}
        fill="var(--d-green)"
        fillOpacity="0.2"
        stroke="var(--d-green)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {dims.map((d, i) => {
        const [x, y] = point(i, scores[d] * progress);
        return (
          <circle
            key={d}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r="5"
            fill="white"
            stroke="var(--d-green-deep)"
            strokeWidth="2.5"
          />
        );
      })}
      {/* Labels */}
      {dims.map((d, i) => {
        const dim = RIASEC_DIMS[d];
        const a = angle(i);
        const lx = cx + Math.cos(a) * (r + 26);
        const ly = cy + Math.sin(a) * (r + 26);
        return (
          <g key={d}>
            <text
              x={lx.toFixed(1)}
              y={(ly - 4).toFixed(1)}
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill={dim.color}
            >
              {d}
            </text>
            <text
              x={lx.toFixed(1)}
              y={(ly + 11).toFixed(1)}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink-3)"
            >
              {dim.th}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
