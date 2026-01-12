import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Fetch NFC analytics data
export async function GET(request: NextRequest) {
  try {
    console.log('[NFC Analytics API] Request received');
    const supabase = await createClient();

    // Check if user is authenticated admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[NFC Analytics API] Auth check:', { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      console.error('[NFC Analytics API] Authentication failed');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin/moderator status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    console.log('[NFC Analytics API] Profile check:', { role: profileData?.role, isActive: profileData?.is_active, error: profileError?.message });

    if (profileError || !profileData?.is_active ||
        !['admin', 'moderator'].includes(profileData.role)) {
      console.error('[NFC Analytics API] Authorization failed');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    console.log('[NFC Analytics API] Action:', action);

    if (action === 'overview') {
      // Get total visits
      const { count: totalVisits } = await supabase
        .from('nfc_page_visits')
        .select('*', { count: 'exact', head: true });

      // Get unique visitors (approximate - based on unique session IDs)
      const { data: uniqueSessionsData } = await supabase
        .from('nfc_page_visits')
        .select('session_id');

      const uniqueVisitors = new Set(
        uniqueSessionsData?.map((v) => v.session_id).filter(Boolean)
      ).size;

      // Get total link clicks
      const { count: totalClicks } = await supabase
        .from('nfc_link_clicks')
        .select('*', { count: 'exact', head: true });

      // Get visits today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: visitsToday } = await supabase
        .from('nfc_page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_timestamp', today.toISOString());

      // Get visits this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: visitsThisWeek } = await supabase
        .from('nfc_page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_timestamp', weekAgo.toISOString());

      // Get visits this month
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const { count: visitsThisMonth } = await supabase
        .from('nfc_page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_timestamp', monthAgo.toISOString());

      // Get device breakdown
      const { data: deviceData } = await supabase
        .from('nfc_page_visits')
        .select('device_type');

      const deviceBreakdown = deviceData?.reduce(
        (acc, curr) => {
          const device = curr.device_type || 'unknown';
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Get top clicked links
      const { data: clickData } = await supabase
        .from('nfc_link_clicks')
        .select('link_name, link_url');

      const linkClickCounts = clickData?.reduce(
        (acc, curr) => {
          const key = curr.link_name;
          if (!acc[key]) {
            acc[key] = { name: key, url: curr.link_url, count: 0 };
          }
          acc[key].count++;
          return acc;
        },
        {} as Record<string, { name: string; url: string; count: number }>
      );

      const topLinks = Object.values(linkClickCounts || {})
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get browser breakdown
      const { data: browserData } = await supabase
        .from('nfc_page_visits')
        .select('browser');

      const browserBreakdown = browserData?.reduce(
        (acc, curr) => {
          const browser = curr.browser || 'unknown';
          acc[browser] = (acc[browser] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Get OS breakdown
      const { data: osData } = await supabase
        .from('nfc_page_visits')
        .select('os');

      const osBreakdown = osData?.reduce(
        (acc, curr) => {
          const os = curr.os || 'unknown';
          acc[os] = (acc[os] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const statsResponse = {
        totalVisits: totalVisits || 0,
        uniqueVisitors: uniqueVisitors || 0,
        totalClicks: totalClicks || 0,
        visitsToday: visitsToday || 0,
        visitsThisWeek: visitsThisWeek || 0,
        visitsThisMonth: visitsThisMonth || 0,
        deviceBreakdown: deviceBreakdown || {},
        browserBreakdown: browserBreakdown || {},
        osBreakdown: osBreakdown || {},
        topLinks: topLinks || [],
      };

      console.log('[NFC Analytics API] Returning stats:', statsResponse);

      return NextResponse.json({
        success: true,
        stats: statsResponse,
      });
    } else if (action === 'timeline') {
      // Get visits grouped by date for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: timelineData } = await supabase
        .from('nfc_page_visits')
        .select('visit_timestamp')
        .gte('visit_timestamp', thirtyDaysAgo.toISOString())
        .order('visit_timestamp', { ascending: true });

      // Group by date
      const visitsByDate = timelineData?.reduce(
        (acc, curr) => {
          const date = new Date(curr.visit_timestamp).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Convert to array and fill missing dates
      const timeline = [];
      const currentDate = new Date(thirtyDaysAgo);
      const today = new Date();

      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        timeline.push({
          date: dateStr,
          visits: visitsByDate?.[dateStr] || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return NextResponse.json({
        success: true,
        timeline,
      });
    } else if (action === 'recent') {
      // Get recent visits and clicks
      const { data: recentVisits } = await supabase
        .from('nfc_page_visits')
        .select('*')
        .order('visit_timestamp', { ascending: false })
        .limit(50);

      const { data: recentClicks } = await supabase
        .from('nfc_link_clicks')
        .select('*')
        .order('click_timestamp', { ascending: false })
        .limit(50);

      return NextResponse.json({
        success: true,
        recentVisits: recentVisits || [],
        recentClicks: recentClicks || [],
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
