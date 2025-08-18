import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get available upload dates (months/years) for filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distinct months and years from uploaded media
    const { data: dates, error } = await supabase
      .from('media_library')
      .select('created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 });
    }

    // Process dates to get unique month/year combinations
    const uniqueDates = new Set<string>();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    dates?.forEach(item => {
      const date = new Date(item.created_at);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const monthYear = `${year}-${(month + 1).toString().padStart(2, '0')}`; // YYYY-MM format for value
      const displayText = `${monthNames[month]} ${year}`; // "January 2025" format for display
      
      if (!uniqueDates.has(monthYear)) {
        uniqueDates.add(JSON.stringify({ value: monthYear, label: displayText }));
      }
    });

    // Convert back to objects and sort by date (newest first)
    const availableDates = Array.from(uniqueDates)
      .map(dateStr => JSON.parse(dateStr))
      .sort((a, b) => b.value.localeCompare(a.value));

    return NextResponse.json({
      success: true,
      dates: availableDates
    });

  } catch (error) {
    console.error('Media dates fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}