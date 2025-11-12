import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendTextMessage } from '../../../lib/whatsapp';

const payloadSchema = z.object({
  to: z.string().min(8, 'Phone number is required'),
  message: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { to, message } = payloadSchema.parse(json);
    await sendTextMessage(to, message);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}
