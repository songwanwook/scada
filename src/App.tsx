import { useEffect, useState } from "react";
import { axhub } from "./lib/axhub";
import { useScadaData } from "./hooks/useScadaData";
import { KpiCard } from "./components/KpiCard";
import { ProcessDiagram } from "./components/ProcessDiagram";
import { AlarmPanel } from "./components/AlarmPanel";
import { TrendChart } from "./components/TrendChart";

// GET /api/v1/me 응답 (axhub 백엔드). 로그인한 사용자 + 활성 테넌트 멤버십.
type Me = {
  user: { id: string; email: string; name: string; platform_admin: boolean };
  tenants: { tenant_id: string; tenant_slug: string; role: string; is_active: boolean }[];
};

function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [now, setNow] = useState(() => new Date());
  const { metrics, pumpRunning, valveOpen, alarms } = useScadaData();

  useEffect(() => {
    if (!axhub.isConfigured) return;
    // 브라우저가 axhub 세션 쿠키(_hub_access)를 자동 전송해요 (credentials:"include").
    axhub
      .fetch("/api/v1/me")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setMe((await res.json()) as Me);
      })
      .catch(() => {
        /* 상단 상태바는 로그인 실패 시 "로컬 실행"으로만 표시하고, 화면은 계속 보여줘요. */
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeAlarmCount = alarms.filter((a) => a.severity !== "normal").length;

  return (
    <main className="min-h-screen bg-[var(--bg-surface)] text-[var(--fg-default)]">
      <div className="mx-auto max-w-6xl px-5 py-6">
        {/* 상단 상태바 */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-content)] px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-sm font-bold text-white">
              SC
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">울산화학 SCADA 관제 시스템</h1>
              <p className="text-[11px] text-[var(--fg-subtle)]">공정 1라인 · 실시간 모니터링</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {activeAlarmCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--danger)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--danger)]" />
                활성 알람 {activeAlarmCount}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              시스템 연결됨
            </span>
            <span className="tabular-nums text-[11px] text-[var(--fg-muted)]">
              {now.toLocaleTimeString("ko-KR", { hour12: false })}
            </span>
            <span className="text-[11px] text-[var(--fg-subtle)]">
              {me ? `${me.user.name}님` : axhub.isConfigured ? "로그인 확인 중…" : "로컬 실행"}
            </span>
          </div>
        </header>

        {/* KPI 카드 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            label={metrics.temperature.label}
            value={metrics.temperature.value}
            unit={metrics.temperature.unit}
            status={metrics.temperature.status}
            history={metrics.temperature.history}
          />
          <KpiCard
            label={metrics.pressure.label}
            value={metrics.pressure.value}
            unit={metrics.pressure.unit}
            status={metrics.pressure.status}
            history={metrics.pressure.history}
          />
          <KpiCard
            label={metrics.flow.label}
            value={metrics.flow.value}
            unit={metrics.flow.unit}
            status={metrics.flow.status}
            history={metrics.flow.history}
          />
          <KpiCard
            label={metrics.level.label}
            value={metrics.level.value}
            unit={metrics.level.unit}
            status={metrics.level.status}
            history={metrics.level.history}
          />
        </div>

        {/* 공정 흐름도 + 알람 로그 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <ProcessDiagram
            level={metrics.level.value}
            levelStatus={metrics.level.status}
            pumpRunning={pumpRunning}
            valveOpen={valveOpen}
          />
          <AlarmPanel alarms={alarms} />
        </div>

        {/* 트렌드 차트 */}
        <div className="mt-4">
          <TrendChart metrics={metrics} />
        </div>

        <footer className="mt-6 text-center text-[11px] text-[var(--fg-subtle)]">
          Vite · React · Tailwind — 데이터는 시뮬레이션 값이에요 (실제 설비 값 아님)
        </footer>
      </div>
    </main>
  );
}

export default App;

/* ─────────────────────────────────────────────────────────────────────────────
 * 🤖 Claude Code / AI 에이전트 — 백엔드 호출 치트시트 (지우지 말 것)
 *
 * 화면을 깔끔히 하려고 아래 패턴들을 주석으로 내렸을 뿐, 이 앱에서 axhub 백엔드를
 * 쓸 때 그대로 쓰는 정식 패턴이다. 정적 SPA — 브라우저에서 호출한다.
 * 인증은 credentials:"include" 로 axhub 세션 쿠키(_hub_access)가 자동 전송되고,
 * 401 이면 헬퍼가 silent SSO 로 재인증한다. API 키를 코드에 넣지 않는다.
 * 설정(API_BASE·slug)은 배포 시 src/lib/axhub.ts 에 자동 주입된다.
 *
 * 1) 내 정보 · Hub API  (위 상단 상태바가 이 호출 결과)
 *    const res = await axhub.fetch("/api/v1/me");
 *    const me = await res.json(); // { user, tenants }
 *
 * 2) 데이터 저장/조회가 필요하면?
 *    이 템플릿은 정적 SPA 라 자체 데이터베이스가 없어요. 데이터 저장/조회가 필요하면
 *    서버 템플릿(nextjs-axhub / astro-axhub)을 쓰세요 — 거기선 표준 Postgres 를 써요.
 *    (이 SCADA 화면의 온도/압력/유량/레벨 값은 실데이터가 아니라 브라우저 시뮬레이션이다 — src/hooks/useScadaData.ts)
 * ───────────────────────────────────────────────────────────────────────────── */
