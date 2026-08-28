import type { Severity } from "../hooks/useScadaData";

const STATUS_COLOR: Record<Severity, string> = {
  normal: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

type Props = {
  level: number;
  levelStatus: Severity;
  pumpRunning: boolean;
  valveOpen: boolean;
};

export function ProcessDiagram({ level, levelStatus, pumpRunning, valveOpen }: Props) {
  const fillHeight = Math.max(4, (level / 100) * 120);
  const levelColor = STATUS_COLOR[levelStatus];
  const pumpColor = pumpRunning ? "var(--success)" : "var(--fg-subtle)";
  const valveColor = valveOpen ? "var(--primary)" : "var(--fg-subtle)";

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-content)] p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-[var(--fg-muted)]">공정 흐름도</p>
      <svg viewBox="0 0 640 200" className="w-full" role="img" aria-label="공정 흐름도">
        {/* 원료 탱크 */}
        <rect x="20" y="40" width="70" height="120" rx="6" fill="none" stroke="var(--border-default)" strokeWidth="2" />
        <rect x="24" y="80" width="62" height="76" rx="3" fill="var(--primary-soft)" />
        <text x="55" y="176" textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">원료 탱크</text>

        {/* 배관: 원료 탱크 -> 펌프 */}
        <line x1="90" y1="100" x2="170" y2="100" stroke="var(--border-default)" strokeWidth="4" />
        <line
          x1="90" y1="100" x2="170" y2="100"
          stroke={pumpColor} strokeWidth="3" strokeDasharray="6 6"
          className={pumpRunning ? "scada-flow" : ""}
        />

        {/* 펌프 */}
        <circle cx="200" cy="100" r="30" fill="var(--bg-content)" stroke={pumpColor} strokeWidth="3" />
        <path d="M188 88 L214 100 L188 112 Z" fill={pumpColor} />
        <text x="200" y="147" textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">
          펌프 A · {pumpRunning ? "가동" : "정지"}
        </text>

        {/* 배관: 펌프 -> 반응조 */}
        <line x1="230" y1="100" x2="330" y2="100" stroke="var(--border-default)" strokeWidth="4" />
        <line
          x1="230" y1="100" x2="330" y2="100"
          stroke={pumpColor} strokeWidth="3" strokeDasharray="6 6"
          className={pumpRunning ? "scada-flow" : ""}
        />

        {/* 반응조 (레벨 탱크) */}
        <rect x="330" y="30" width="90" height="140" rx="6" fill="none" stroke="var(--border-default)" strokeWidth="2" />
        <rect x="334" y={166 - fillHeight} width="82" height={fillHeight} rx="3" fill={levelColor} opacity="0.55" />
        <text x="375" y="186" textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">
          반응조 · {level.toFixed(0)}%
        </text>

        {/* 배관: 반응조 -> 밸브 */}
        <line x1="420" y1="100" x2="500" y2="100" stroke="var(--border-default)" strokeWidth="4" />
        <line
          x1="420" y1="100" x2="500" y2="100"
          stroke={valveColor} strokeWidth="3" strokeDasharray="6 6"
          className={valveOpen ? "scada-flow" : ""}
        />

        {/* 밸브 */}
        <rect x="500" y="85" width="30" height="30" rx="4" fill="var(--bg-content)" stroke={valveColor} strokeWidth="3" />
        <text x="515" y="140" textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">
          밸브 V-1 · {valveOpen ? "개방" : "폐쇄"}
        </text>

        {/* 배관: 밸브 -> 배출 */}
        <line x1="530" y1="100" x2="600" y2="100" stroke="var(--border-default)" strokeWidth="4" />
        <line
          x1="530" y1="100" x2="600" y2="100"
          stroke={valveColor} strokeWidth="3" strokeDasharray="6 6"
          className={valveOpen ? "scada-flow" : ""}
        />
        <text x="612" y="104" textAnchor="start" className="fill-[var(--fg-subtle)] text-[10px]">
          배출
        </text>
      </svg>
    </div>
  );
}
