import { NextRequest, NextResponse } from 'next/server';
import { getAgentState, updateConfig } from '../../../lib/store';
import { configSchema, ConfigPayload } from '../../../lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = getAgentState();
  return NextResponse.json(state.config);
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as ConfigPayload;
    const validated = configSchema.parse(payload);
    const updated = updateConfig(() => validated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}
