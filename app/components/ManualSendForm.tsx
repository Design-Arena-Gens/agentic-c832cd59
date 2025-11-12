'use client';

import { useState } from 'react';

export default function ManualSendForm() {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('Hello! This is an automated update from our agent.');
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Failed to send message');
      }
      setStatus('Message queued for delivery');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Manual broadcast</h3>
      <p className="mt-1 text-sm text-slate-500">
        Quickly send a one-off WhatsApp message directly from your dashboard.
      </p>
      <label className="mt-4 block text-sm font-medium text-slate-600">
        Recipient number (E.164, e.g. +14155552671)
      </label>
      <input
        value={to}
        onChange={(event) => setTo(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
        placeholder="+14155552671"
        required
      />
      <label className="mt-4 block text-sm font-medium text-slate-600">Message</label>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-emerald-500 focus:outline-none"
      />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">{status}</span>
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
