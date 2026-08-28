import { useState } from "react";
import type { Metric, MetricKey, Severity } from "../hooks/useScadaData";

const STATUS_COLOR: Record<Severity, string> = {
  normal: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

const WIDTH = 560;
const HEIGHT = 160;

export function TrendChart({ metrics }: { metrics: Record<MetricKey, Metric> }) {
  const [active, setActive] = useState<MetricKey>("temperature");
  const m = metrics[active];
  const data = m.history;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * WIDTH;
    const y = HEIGHT - ((v - min) / span) * (HEIGHT - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = STATUS_COLOR[m.status];
  const areaPath = `M0,${HEIGHT} L${points.join(" L")} L${WIDTH},${HEIGHT} Z`;

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-content)] p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--fg-muted)]">트렌드</p>
        <div className="flex gap-1">
          {(Object.keys(metrics) as MetricKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActive(k)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                active === k
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary-soft-hover)]"
              }`}
            >
              {metrics[k].label}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={WIDTH}
            y1={HEIGHT * f}
            y2={HEIGHT * f}
            stroke="var(--border-default)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaPath} fill={color} opacity="0.12" />
        <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mt-2 text-right text-sm font-semibold" style={{ color }}>
        현재 {m.value.toFixed(1)}
        {m.unit}
      </p>
    </div>
  );
}
