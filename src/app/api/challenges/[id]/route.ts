import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// GET - Single challenge with winners (public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serviceClient = createServiceClient();

    const [challengeRes, winnersRes] = await Promise.all([
      serviceClient.from('challenges').select('*').eq('id', id).single(),
      serviceClient.from('challenge_winners').select('*').eq('challenge_id', id).order('rank', { ascending: true }),
    ]);

    if (challengeRes.error || !challengeRes.data) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    }

    const data = challengeRes.data;
    const now = new Date();
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    let computed_status = data.status;
    if (data.status === 'active') {
      if (now < start) computed_status = 'upcoming';
      else if (now > end) computed_status = 'ended';
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        computed_status,
        winners: winnersRes.data || [],
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch challenge' }, { status: 500 });
  }
}
