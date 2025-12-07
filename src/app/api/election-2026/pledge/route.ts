import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate unique pledge ID
async function generatePledgeId(): Promise<string> {
  let id: string;
  let exists = true;

  while (exists) {
    // Generate random 6-character alphanumeric
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    id = `SP-${random}`;

    const { data } = await supabase
      .from('support_pledges')
      .select('pledge_id')
      .eq('pledge_id', id)
      .single();
    exists = !!data;
  }

  return id!;
}

// GET - Get pledge stats and recent pledges
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get total count
      const { count: totalCount } = await supabase
        .from('support_pledges')
        .select('*', { count: 'exact', head: true });

      // Get count by thana
      const { data: byThana } = await supabase
        .from('support_pledges')
        .select('thana')
        .not('thana', 'is', null);

      const thanaStats: Record<string, number> = {};
      (byThana || []).forEach(p => {
        if (p.thana) {
          thanaStats[p.thana] = (thanaStats[p.thana] || 0) + 1;
        }
      });

      // Get recent public pledges (last 10)
      const { data: recentPledges } = await supabase
        .from('support_pledges')
        .select('name, thana, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('support_pledges')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return NextResponse.json({
        success: true,
        stats: {
          total: totalCount || 0,
          today: todayCount || 0,
          byThana: thanaStats,
          recentPledges: recentPledges || []
        }
      });
    }

    // Default: just return total count
    const { count } = await supabase
      .from('support_pledges')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      count: count || 0
    });

  } catch (error) {
    console.error('Error fetching pledge stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// POST - Create a new pledge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, thana, ward, message, is_public } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your name (at least 2 characters)' },
        { status: 400 }
      );
    }

    // Generate unique pledge ID
    const pledgeId = await generatePledgeId();

    // Insert pledge
    const { data: pledge, error } = await supabase
      .from('support_pledges')
      .insert({
        pledge_id: pledgeId,
        name: name.trim(),
        phone: phone?.trim() || null,
        thana: thana || null,
        ward: ward || null,
        message: message?.trim() || null,
        is_public: is_public !== false // Default to true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pledge:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit pledge' },
        { status: 500 }
      );
    }

    // Get updated count
    const { count } = await supabase
      .from('support_pledges')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      pledge: {
        pledge_id: pledge.pledge_id,
        name: pledge.name,
        created_at: pledge.created_at
      },
      totalCount: count || 0,
      message: 'Thank you for your support!'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
