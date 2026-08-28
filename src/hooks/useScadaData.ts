import { useEffect, useRef, useState } from "react";

// 이 템플릿은 정적 SPA라 자체 DB/실제 설비 연동이 없어요.
// 아래는 SCADA 화면 데모용으로 브라우저에서 값을 흉내 내는 시뮬레이션이에요.

export type Severity = "normal" | "warning" | "danger";

export type MetricKey = "temperature" | "pressure" | "flow" | "level";

export type Metric = {
  label: string;
  value: number;
  unit: string;
  status: Severity;
  history: number[];
};

export type Alarm = {
  id: number;
  time: string;
  severity: Severity;
  message: string;
};

type Range = {
  label: string;
  unit: string;
  min: number;
  max: number;
  warnLow: number;
  warnHigh: number;
  dangerLow: number;
  dangerHigh: number;
  step: number;
};

const RANGES: Record<MetricKey, Range> = {
  temperature: { label: "온도", unit: "°C", min: 40, max: 95, warnLow: 58, warnHigh: 80, dangerLow: 50, dangerHigh: 88, step: 0.8 },
  pressure: { label: "압력", unit: "bar", min: 1.5, max: 6, warnLow: 2.6, warnHigh: 4.8, dangerLow: 2.0, dangerHigh: 5.4, step: 0.06 },
  flow: { label: "유량", unit: "m³/h", min: 0, max: 220, warnLow: 100, warnHigh: 195, dangerLow: 60, dangerHigh: 210, step: 3 },
  level: { label: "탱크 레벨", unit: "%", min: 0, max: 100, warnLow: 25, warnHigh: 82, dangerLow: 12, dangerHigh: 92, step: 1.4 },
};

const HISTORY_LEN = 24;
const METRIC_KEYS = Object.keys(RANGES) as MetricKey[];
const TARGET_PULL = 0.04; // 정상 범위 중심으로 서서히 되돌아가는 힘

function classify(v: number, r: Range): Severity {
  if (v <= r.dangerLow || v >= r.dangerHigh) return "danger";
  if (v <= r.warnLow || v >= r.warnHigh) return "warning";
  return "normal";
}

function seedHistory(start: number): number[] {
  return Array.from({ length: HISTORY_LEN }, () => start);
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("ko-KR", { hour12: false });
}

let alarmSeq = 0;

export type ScadaState = {
  metrics: Record<MetricKey, Metric>;
  pumpRunning: boolean;
  valveOpen: boolean;
  alarms: Alarm[];
};

export function useScadaData(): ScadaState {
  const [metrics, setMetrics] = useState<Record<MetricKey, Metric>>(() => {
    const init = {} as Record<MetricKey, Metric>;
    METRIC_KEYS.forEach((k) => {
      const r = RANGES[k];
      const start = (r.warnLow + r.warnHigh) / 2;
      init[k] = { label: r.label, unit: r.unit, value: start, status: "normal", history: seedHistory(start) };
    });
    return init;
  });
  const [pumpRunning, setPumpRunning] = useState(true);
  const [valveOpen, setValveOpen] = useState(true);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const prevStatus = useRef<Record<MetricKey, Severity>>({
    temperature: "normal",
    pressure: "normal",
    flow: "normal",
    level: "normal",
  });
  const pushAlarm = (severity: Severity, message: string) => {
    setAlarms((a) => [{ id: ++alarmSeq, time: nowLabel(), severity, message }, ...a].slice(0, 20));
  };

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) => {
        const next = { ...prev };
        METRIC_KEYS.forEach((k) => {
          const r = RANGES[k];
          const cur = prev[k];
          const target = (r.warnLow + r.warnHigh) / 2;
          let drift = (Math.random() - 0.5) * r.step * 2;
          drift += (target - cur.value) * TARGET_PULL;
          if (k === "flow" && !pumpRunning) drift -= r.step * 1.5;
          const v = Math.max(r.min, Math.min(r.max, cur.value + drift));
          const status = classify(v, r);
          if (status !== "normal" && status !== prevStatus.current[k]) {
            pushAlarm(status, `${r.label} ${status === "danger" ? "위험" : "경고"} — ${v.toFixed(1)}${r.unit}`);
          }
          prevStatus.current[k] = status;
          next[k] = { ...cur, value: v, status, history: [...cur.history.slice(1), v] };
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [pumpRunning]);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.12) {
        setPumpRunning((p) => {
          const next = !p;
          pushAlarm(next ? "normal" : "warning", `펌프 A ${next ? "가동 시작" : "정지"}`);
          return next;
        });
      }
      if (Math.random() < 0.08) {
        setValveOpen((v) => {
          const next = !v;
          pushAlarm("normal", `밸브 V-1 ${next ? "개방" : "폐쇄"}`);
          return next;
        });
      }
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return { metrics, pumpRunning, valveOpen, alarms };
}
