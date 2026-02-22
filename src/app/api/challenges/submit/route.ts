import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// POST - Submit a challenge entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenge_id, name, mobile, description, files } = body;

    if (!challenge_id || !mobile) {
      return NextResponse.json({ success: false, error: 'challenge_id and mobile are required' }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
    }
    if (description.trim().length > 500) {
      return NextResponse.json({ success: false, error: 'Description must be 500 characters or less' }, { status: 400 });
    }
    if (files && Array.isArray(files) && files.length > 5) {
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
      .insert({ challenge_id, name: name ? name.trim() : null, mobile: mobile.trim(), description: description.trim(), files: files && files.length > 0 ? files : null })
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
