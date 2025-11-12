import AutomationStudio from './components/AutomationStudio';
import LogsPanel from './components/LogsPanel';
import ManualSendForm from './components/ManualSendForm';
import StatusOverview from './components/StatusOverview';
import { getAgentState } from '../lib/store';

export default function Home() {
  const state = getAgentState();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">WhatsApp Auto Reply Agent</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Connect your Meta WhatsApp Business account, craft smart automations, and let the agent respond instantly while you focus on high-value conversations.
            </p>
          </div>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Cloud API docs ↗
          </a>
        </div>
        <StatusOverview />
      </header>

      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <AutomationStudio initialConfig={state.config} />
        <div className="space-y-6">
          <ManualSendForm />
          <LogsPanel initialLogs={state.logs.slice(0, 50)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Deployment checklist</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_VERIFY_TOKEN` in Vercel project settings.</li>
          <li>Deploy your webhook endpoint (`/api/webhook`) and point the Meta App configuration to `https://agentic-c832cd59.vercel.app/api/webhook`.</li>
          <li>Subscribe the webhook to message events, then send a test message from your WhatsApp number to confirm instant replies.</li>
        </ol>
      </section>
    </main>
  );
}
