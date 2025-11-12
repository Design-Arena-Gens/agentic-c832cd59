import { NextRequest, NextResponse } from 'next/server';
import { evaluateRules, getVerifyToken, sendTextMessage } from '../../../lib/whatsapp';
import { getAgentState, pushLog } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const challenge = url.searchParams.get('hub.challenge');
  const token = url.searchParams.get('hub.verify_token');

  if (mode === 'subscribe' && token && token === getVerifyToken()) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }

  return NextResponse.json({ message: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = body.entry ?? [];

    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const messages = change.value?.messages ?? [];
        const contacts = change.value?.contacts ?? [];

        messages.forEach(async (message: any) => {
          if (message.type !== 'text') return;
          const contact = contacts.find((c: any) => c.wa_id === message.from) ?? {};
          const contactName = contact.profile?.name ?? message.from;
          const textBody = message.text?.body ?? '';

          pushLog({
            id: crypto.randomUUID(),
            direction: 'incoming',
            timestamp: new Date().toISOString(),
            contact: `${contactName}`,
            preview: textBody.slice(0, 120)
          });

          const state = getAgentState();
          const matchedRule = evaluateRules(state.config.rules, textBody);
          const reply = matchedRule?.response ?? state.config.defaultResponse;

          if (state.config.aiEnabled && !matchedRule) {
            // placeholder AI logic; integrate an LLM provider here
            const enriched = `${reply}\n\n(Automated AI note: I\'ll follow up with more details soon.)`;
            await sendTextMessage(message.from, enriched);
            return;
          }

          if (reply) {
            await sendTextMessage(message.from, reply);
          }
        });
      }
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Webhook error',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
