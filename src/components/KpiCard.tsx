import type { Severity } from "../hooks/useScadaData";
import { Sparkline } from "./Sparkline";

const STATUS_META: Record<Severity, { label: string; color: string; soft: string }> = {
  normal: { label: "정상", color: "var(--success)", soft: "var(--success-soft)" },
  warning: { label: "경고", color: "var(--warning)", soft: "var(--warning-soft)" },
  danger: { label: "위험", color: "var(--danger)", soft: "var(--danger-soft)" },
};

type Props = {
  label: string;
  value: number;
  unit: string;
  status: Severity;
  history: number[];
};

export function KpiCard({ label, value, unit, status, history }: Props) {
  const meta = STATUS_META[status];
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-content)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--fg-muted)]">{label}</p>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: meta.color, backgroundColor: meta.soft }}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status === "danger" ? "animate-pulse" : ""}`}
            style={{ backgroundColor: meta.color }}
          />
          {meta.label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
        {value.toFixed(1)}
        <span className="ml-1 text-sm font-medium text-[var(--fg-subtle)]">{unit}</span>
      </p>
      <div className="mt-2">
        <Sparkline data={history} color={meta.color} />
      </div>
    </div>
  );
}
