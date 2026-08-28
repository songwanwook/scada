import type { Alarm } from "../hooks/useScadaData";

const SEVERITY_META: Record<Alarm["severity"], { label: string; color: string; soft: string }> = {
  normal: { label: "정보", color: "var(--success)", soft: "var(--success-soft)" },
  warning: { label: "경고", color: "var(--warning)", soft: "var(--warning-soft)" },
  danger: { label: "위험", color: "var(--danger)", soft: "var(--danger-soft)" },
};

export function AlarmPanel({ alarms }: { alarms: Alarm[] }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-content)] p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-[var(--fg-muted)]">알람 / 이벤트 로그</p>
      {alarms.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--fg-subtle)]">이벤트 없음</p>
      ) : (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {alarms.map((a) => {
            const meta = SEVERITY_META[a.severity];
            return (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs"
                style={{ backgroundColor: meta.soft }}
              >
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span className="flex-1 truncate text-[var(--fg-default)]">{a.message}</span>
                <span className="shrink-0 tabular-nums text-[var(--fg-subtle)]">{a.time}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
