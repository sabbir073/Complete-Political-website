import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - List all available badges
export async function GET() {
  try {
    const { data: badges, error } = await supabase
      .from('volunteer_badges')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      badges: badges || []
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
