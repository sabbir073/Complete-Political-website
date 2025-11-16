import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/media/alt-text - Get alt text for a media URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Try to find the media by various URL formats
    const { data: media, error } = await supabase
      .from('media_library')
      .select('alt_text, filename, original_filename')
      .or(`s3_url.eq.${url},cloudfront_url.eq.${url},filename.eq.${url.split('/').pop()}`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Media alt text fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch alt text' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alt_text: media?.alt_text || null,
      filename: media?.filename || null
    });

  } catch (error) {
    console.error('Media alt text API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}