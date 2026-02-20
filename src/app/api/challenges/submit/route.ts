import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// POST - Submit a challenge entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenge_id, name, mobile, files } = body;

    if (!challenge_id || !name || !mobile) {
      return NextResponse.json({ success: false, error: 'challenge_id, name, and mobile are required' }, { status: 400 });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one file is required' }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json({ success: false, error: 'Maximum 5 files allowed' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Verify challenge is active
    const { data: challenge, error: challengeError } = await serviceClient
      .from('challenges')
      .select('id, status, start_date, end_date')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    }

    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);

    if (challenge.status !== 'active' || now < start || now > end) {
      return NextResponse.json({ success: false, error: 'This challenge is not currently accepting submissions' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('challenge_submissions')
      .insert({ challenge_id, name: name.trim(), mobile: mobile.trim(), files })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
  }
}
