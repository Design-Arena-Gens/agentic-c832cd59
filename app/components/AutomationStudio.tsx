'use client';

import { useEffect, useMemo, useState } from 'react';
import { AgentConfig, AutomationRule } from '../../lib/types';
import { automationRuleSchema, configSchema } from '../../lib/validation';

const emptyRule = (): AutomationRule => ({
  id: crypto.randomUUID(),
  name: 'New rule',
  matchType: 'contains',
  pattern: 'hello',
  response: 'Hi! Thanks for your message.',
  active: true
});

type Props = {
  initialConfig: AgentConfig;
};

type ErrorState = {
  field: string;
  message: string;
};

export default function AutomationStudio({ initialConfig }: Props) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ErrorState[]>([]);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const activeRules = useMemo(() => config.rules.filter((rule) => rule.active), [config.rules]);

  const handleChange = (partial: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  };

  const updateRule = (id: string, partial: Partial<AutomationRule>) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.id === id ? { ...rule, ...partial } : rule))
    }));
    setDirty(true);
  };

  const removeRule = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.filter((rule) => rule.id !== id)
    }));
    setDirty(true);
  };

  const addRule = () => {
    setConfig((prev) => ({
      ...prev,
      rules: [...prev.rules, emptyRule()]
    }));
    setDirty(true);
  };

  const persist = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const validated = configSchema.parse(config);
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Failed to save configuration');
      }
      const next = (await response.json()) as AgentConfig;
      setConfig(next);
      setDirty(false);
      setStatus('Configuration saved');
    } catch (error) {
      if (error instanceof Error) {
        setStatus(error.message);
      }
      const validationErrors: ErrorState[] = [];
      if (error && typeof error === 'object' && 'errors' in (error as any)) {
        const zodErr = error as any;
        zodErr.errors.forEach((err: any) => {
          validationErrors.push({ field: err.path.join('.'), message: err.message });
        });
      }
      setErrors(validationErrors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Automation studio</h2>
        <p className="mt-2 text-sm text-slate-600">
          Design rules that auto-respond the moment a WhatsApp message lands in your inbox.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Fallback response</h3>
            <p className="mt-1 text-sm text-slate-500">
              Sent whenever no rule matches the incoming message.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={config.aiEnabled}
              onChange={(event) => handleChange({ aiEnabled: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Enrich with AI follow-up
          </label>
        </div>
        <textarea
          value={config.defaultResponse}
          onChange={(event) => handleChange({ defaultResponse: event.target.value })}
          rows={4}
          className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm shadow-inner focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rules ({activeRules.length} active)</h3>
          <button
            onClick={addRule}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
          >
            Add rule
          </button>
        </div>
        <div className="space-y-4">
          {config.rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={rule.name}
                  onChange={(event) => updateRule(rule.id, { name: event.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Rule name"
                />
                <select
                  value={rule.matchType}
                  onChange={(event) => updateRule(rule.id, { matchType: event.target.value as AutomationRule['matchType'] })}
                  className="rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="always">always</option>
                  <option value="keyword">keyword match</option>
                  <option value="contains">contains</option>
                </select>
                <input
                  value={rule.pattern}
                  onChange={(event) => updateRule(rule.id, { pattern: event.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Trigger keyword or text"
                  disabled={rule.matchType === 'always'}
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={(event) => updateRule(rule.id, { active: event.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Active
                </label>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1 text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={rule.response}
                onChange={(event) => updateRule(rule.id, { response: event.target.value })}
                rows={3}
                className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm shadow-inner focus:border-emerald-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <p className="font-semibold">Validation issues</p>
          <ul className="mt-2 space-y-2">
            {errors.map((error) => (
              <li key={error.field}>
                <span className="font-medium">{error.field}: </span>
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="text-sm text-slate-500">
          {status ? status : dirty ? 'Unsaved changes' : 'All changes saved'}
        </div>
        <button
          onClick={persist}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {saving ? 'Saving…' : 'Save configuration'}
        </button>
      </div>
    </section>
  );
}
