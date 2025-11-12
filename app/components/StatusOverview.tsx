import { getEnvStatus } from '../../lib/whatsapp';

const statusItems = [
  {
    key: 'tokenConfigured',
    label: 'Cloud API Token'
  },
  {
    key: 'phoneConfigured',
    label: 'Phone Number ID'
  },
  {
    key: 'verifyConfigured',
    label: 'Webhook Verify Token'
  }
] as const;

export default function StatusOverview() {
  const status = getEnvStatus();

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {statusItems.map(({ key, label }) => {
        const configured = status[key];
        return (
          <div
            key={key}
            className={`rounded-xl border px-5 py-6 shadow-sm transition ${
              configured ? 'border-green-200 bg-white' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-semibold">
              {configured ? 'Configured' : 'Missing'}
            </p>
            {!configured && (
              <p className="mt-2 text-sm text-slate-500">
                Add `{key === 'tokenConfigured' ? 'WHATSAPP_TOKEN' : key === 'phoneConfigured' ? 'WHATSAPP_PHONE_NUMBER_ID' : 'WHATSAPP_VERIFY_TOKEN'}` to your
                environment.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
