import { NextResponse } from 'next/server';
import { updateSession, getActiveCount } from '@/lib/presence';

export async function POST(request) {
  try {
    const { sessionId } = await request.json();
    if (sessionId) {
      updateSession(sessionId);
    }
    return NextResponse.json({ success: true, count: getActiveCount() });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ count: getActiveCount() });
}
