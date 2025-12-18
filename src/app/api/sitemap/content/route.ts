import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch news articles
    const { data: news } = await supabase
      .from('news')
      .select('title_en, slug, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch events
    const { data: events } = await supabase
      .from('events')
      .select('title_en, slug, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch photo albums
    const { data: albums } = await supabase
      .from('photo_albums')
      .select('title_en, slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch store products
    const { data: products } = await supabase
      .from('store_products')
      .select('name_en, slug')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        news: (news || []).map(item => ({
          title: item.title_en,
          slug: item.slug,
          created_at: item.created_at
        })),
        events: (events || []).map(item => ({
          title: item.title_en,
          slug: item.slug,
          created_at: item.created_at
        })),
        albums: (albums || []).map(item => ({
          title: item.title_en,
          slug: item.slug
        })),
        products: (products || []).map(item => ({
          name: item.name_en,
          slug: item.slug
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching sitemap content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
