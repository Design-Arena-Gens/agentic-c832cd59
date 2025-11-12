'use client';

import { useEffect, useState } from 'react';
import { LogEntry } from '../../lib/types';

type Props = {
  initialLogs: LogEntry[];
};

const refreshInterval = 6000;

export default function LogsPanel({ initialLogs }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    const tick = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = (await response.json()) as LogEntry[];
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(tick, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent activity</h3>
        <span className="text-sm text-slate-500">{loading ? 'Refreshing…' : 'Live'}</span>
      </div>
      <div className="mt-4 space-y-3">
        {logs.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Activity will appear here once your webhook receives a message.
          </p>
        )}
        {logs.map((log) => (
          <article key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className={log.direction === 'incoming' ? 'text-emerald-600' : 'text-slate-600'}>
                {log.direction === 'incoming' ? 'Incoming message' : 'Auto response'}
              </span>
              <time className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</time>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{log.contact}</p>
            <p className="mt-1 text-sm text-slate-600">{log.preview}</p>
            {log.ruleId && (
              <p className="mt-1 text-xs text-slate-500">Rule: {log.ruleId}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
