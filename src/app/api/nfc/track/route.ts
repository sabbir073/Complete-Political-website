import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = 'mobile';
  }

  // Detect browser
  let browser = 'unknown';
  if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detect OS
  let os = 'unknown';
  if (ua.includes('win')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { deviceType, browser, os };
}

// Helper to get IP address
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }

  return 'unknown';
}

// POST - Track page visit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { type, linkName, linkUrl, sessionId } = body;

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || null;
    const ipAddress = getClientIp(request);

    const { deviceType, browser, os } = parseUserAgent(userAgent);

    if (type === 'visit') {
      // Track page visit
      const { data: visit, error } = await supabase
        .from('nfc_page_visits')
        .insert({
          ip_address: ipAddress,
          user_agent: userAgent,
          device_type: deviceType,
          browser,
          os,
          referrer,
          session_id: sessionId,
          is_unique_visitor: true, // Client can update this based on localStorage
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking visit:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to track visit' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        visitId: visit.id,
      });
    } else if (type === 'click') {
      // Track link click
      const { visitId } = body;

      if (!linkName || !linkUrl) {
        return NextResponse.json(
          { success: false, error: 'Missing link information' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('nfc_link_clicks')
        .insert({
          visit_id: visitId || null,
          link_name: linkName,
          link_url: linkUrl,
          ip_address: ipAddress,
          user_agent: userAgent,
          device_type: deviceType,
        });

      if (error) {
        console.error('Error tracking click:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to track click' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid tracking type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
