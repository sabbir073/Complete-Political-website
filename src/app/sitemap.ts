import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://smjahangir.com';

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/about', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/news', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/events', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/events/upcoming', priority: 0.8, changeFrequency: 'daily' as const },
  { url: '/events/archive', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/events/calendar', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/events/town-hall', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/gallery/photos', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/gallery/videos', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/leadership', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/ama', priority: 0.8, changeFrequency: 'daily' as const },
  { url: '/polls', priority: 0.8, changeFrequency: 'daily' as const },
  { url: '/promises', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/achievements', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/testimonials', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/blood-hub', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/volunteer-hub', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/complaints', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/area-problems', priority: 0.6, changeFrequency: 'weekly' as const },
  { url: '/emergency/contacts', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/emergency/safety', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/emergency/sos', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/community-forum', priority: 0.7, changeFrequency: 'daily' as const },
  { url: '/election-2026', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/store', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/gamification', priority: 0.5, changeFrequency: 'weekly' as const },
  { url: '/challenges', priority: 0.5, changeFrequency: 'weekly' as const },
  { url: '/help', priority: 0.4, changeFrequency: 'monthly' as const },
  { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/accessibility', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/site-map', priority: 0.3, changeFrequency: 'weekly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Start with static pages
  const staticSitemapEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Fetch news articles
  const { data: newsArticles } = await supabase
    .from('news')
    .select('slug, updated_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const newsSitemapEntries: MetadataRoute.Sitemap = (newsArticles || []).map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: article.updated_at || article.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Fetch news categories
  const { data: newsCategories } = await supabase
    .from('news_categories')
    .select('slug');

  const categorySitemapEntries: MetadataRoute.Sitemap = (newsCategories || []).map((category) => ({
    url: `${BASE_URL}/news/category/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const eventsSitemapEntries: MetadataRoute.Sitemap = (events || []).map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    lastModified: event.updated_at || event.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Fetch photo albums
  const { data: photoAlbums } = await supabase
    .from('photo_albums')
    .select('slug, updated_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const photoAlbumsSitemapEntries: MetadataRoute.Sitemap = (photoAlbums || []).map((album) => ({
    url: `${BASE_URL}/gallery/photos/${album.slug}`,
    lastModified: album.updated_at || album.created_at,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Fetch AMA questions (answered ones only)
  const { data: amaQuestions } = await supabase
    .from('ama_questions')
    .select('id, updated_at, created_at')
    .eq('status', 'answered')
    .order('created_at', { ascending: false });

  const amaSitemapEntries: MetadataRoute.Sitemap = (amaQuestions || []).map((question) => ({
    url: `${BASE_URL}/ama/${question.id}`,
    lastModified: question.updated_at || question.created_at,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Fetch polls (active and completed)
  const { data: polls } = await supabase
    .from('polls')
    .select('id, updated_at, created_at')
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false });

  const pollsSitemapEntries: MetadataRoute.Sitemap = (polls || []).map((poll) => ({
    url: `${BASE_URL}/polls/${poll.id}`,
    lastModified: poll.updated_at || poll.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Fetch store products
  const { data: products } = await supabase
    .from('store_products')
    .select('slug, updated_at, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const productsSitemapEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${BASE_URL}/store/${product.slug}`,
    lastModified: product.updated_at || product.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Combine all entries
  return [
    ...staticSitemapEntries,
    ...newsSitemapEntries,
    ...categorySitemapEntries,
    ...eventsSitemapEntries,
    ...photoAlbumsSitemapEntries,
    ...amaSitemapEntries,
    ...pollsSitemapEntries,
    ...productsSitemapEntries,
  ];
}
