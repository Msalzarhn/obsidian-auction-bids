import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-11-14T18:00:00-06:00").getTime();

function calc() {
  const diff = Math.max(0, DEADLINE - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

export function Countdown() {
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: Array<[string, number]> = [
    ["Días", t.d],
    ["Horas", t.h],
    ["Min", t.m],
    ["Seg", t.s],
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-5">
      {units.map(([label, value]) => (
        <div
          key={label}
          className="ornament-border rounded-lg bg-royal px-3 py-4 sm:px-6 sm:py-6 text-center shadow-gold"
        >
          <div className="font-display text-3xl sm:text-5xl md:text-6xl text-gradient-gold tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-soft/80">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
