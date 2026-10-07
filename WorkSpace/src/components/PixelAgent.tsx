'use client';

import { useEffect, useRef, useState } from 'react';

const LAST_KEY = 'pixel-agent:last-signature';
const LOGS_KEY = 'pixel-agent:logs';

function readStoredLogs(): string[] {
  try {
    const raw = sessionStorage.getItem(LOGS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function PixelAgent() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');
  const lastSignatureRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    setLogs(readStoredLogs());
    lastSignatureRef.current = sessionStorage.getItem(LAST_KEY);

    const fetchStatus = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        const data = await res.json();
        const task = typeof data.task === 'string' ? data.task.trim() : '';
        const nextStatus = typeof data.status === 'string' ? data.status : 'idle';

        setStatus((prev) => (prev === nextStatus ? prev : nextStatus));

        if (!task) return;

        const signature = `${nextStatus}::${task}`;
        if (lastSignatureRef.current === signature) return;

        lastSignatureRef.current = signature;
        sessionStorage.setItem(LAST_KEY, signature);

        setLogs((prev) => {
          if (prev[prev.length - 1] === task) return prev;
          const next = [...prev, task].slice(-5);
          sessionStorage.setItem(LOGS_KEY, JSON.stringify(next));
          return next;
        });
      } catch (error) {
        console.error('Error fetching agent status:', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const avatarUrl =
    status === 'working'
      ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png'
      : status === 'success'
        ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png'
        : 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Sleeping%20Face.png';

  const statusLabel =
    status === 'working' ? 'กำลังทำงาน' : status === 'success' ? 'เสร็จแล้ว' : 'รอคำสั่ง';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4 font-sans">
      <div className="w-80 rounded-3xl border border-white/40 bg-white/20 p-4 shadow-[0_18px_50px_rgba(92,47,18,0.18)] backdrop-blur-2xl">
        <div className="mb-3 flex items-center gap-2 border-b border-white/30 pb-2">
          <span className="text-amber-600">⚡</span>
          <h3 className="text-sm font-semibold tracking-wide text-amber-950">Agent Workflow</h3>
          <span className="ml-auto rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-medium text-amber-900/80">
            {statusLabel}
          </span>
          <div
            className={`h-2 w-2 rounded-full ${
              status === 'working'
                ? 'animate-pulse bg-amber-400'
                : status === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-emerald-400/80'
            }`}
          />
        </div>
        <div className="flex min-h-[4.5rem] flex-col gap-1">
          {logs.map((log, idx) => (
            <p
              key={`${idx}-${log}`}
              className={`text-sm leading-snug ${
                idx === logs.length - 1 ? 'font-medium text-amber-950' : 'text-amber-900/50'
              }`}
            >
              <span className="mr-2 text-amber-700/40">{'>'}</span>
              {log}
            </p>
          ))}
          {logs.length === 0 && (
            <p className="text-sm italic text-amber-900/50">รอรับคำสั่ง...</p>
          )}
        </div>
      </div>

      <div
        className={`h-20 w-20 drop-shadow-xl ${status === 'working' ? 'animate-bounce' : ''}`}
      >
        <img src={avatarUrl} alt="Pixel Agent" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
