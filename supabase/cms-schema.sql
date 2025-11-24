-- Content Management System Database Schema
-- Tables: categories, events, news, photo_albums, photo_gallery, video_gallery

-- =====================================================
-- 1. CATEGORIES TABLE (Shared across all content types)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('events', 'news', 'photos', 'videos')),
  description_en TEXT,
  description_bn TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content (Multilingual)
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_bn TEXT,
  
  -- Event Details
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  location_en TEXT,
  location_bn TEXT,
  
  -- Media
  featured_image TEXT,
  featured_image_alt_en TEXT,
  featured_image_alt_bn TEXT,
  
  -- Organization
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  -- SEO
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  keywords TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- =====================================================
-- 3. NEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content (Multilingual)
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_bn TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_bn TEXT,
  
  -- Media
  featured_image TEXT,
  featured_image_alt_en TEXT,
  featured_image_alt_bn TEXT,
  
  -- Organization
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_name TEXT,
  read_time INTEGER DEFAULT 5, -- minutes
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  keywords TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- =====================================================
-- 4. PHOTO ALBUMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Album Info (Multilingual)
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  
  -- Media
  cover_image TEXT,
  
  -- Organization
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  display_order INTEGER DEFAULT 0,
  
  -- SEO
  slug TEXT UNIQUE NOT NULL,
  
  -- Metadata
  photo_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PHOTO GALLERY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS photo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Photo Info (Multilingual)
  title_en TEXT,
  title_bn TEXT,
  caption_en TEXT,
  caption_bn TEXT,
  description_en TEXT,
  description_bn TEXT,
  
  -- Media
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text_en TEXT,
  alt_text_bn TEXT,
  
  -- Organization
  album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. VIDEO GALLERY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS video_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Video Info (Multilingual)
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  
  -- Media
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  custom_thumbnail TEXT,
  
  -- Organization
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Metadata
  duration INTEGER,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published_at);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at);

-- Photo albums indexes
CREATE INDEX IF NOT EXISTS idx_photo_albums_status ON photo_albums(status);
CREATE INDEX IF NOT EXISTS idx_photo_albums_slug ON photo_albums(slug);
CREATE INDEX IF NOT EXISTS idx_photo_albums_category ON photo_albums(category_id);

-- Photo gallery indexes
CREATE INDEX IF NOT EXISTS idx_photo_gallery_album ON photo_gallery(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_gallery_category ON photo_gallery(category_id);

-- Video gallery indexes
CREATE INDEX IF NOT EXISTS idx_video_gallery_status ON video_gallery(status);
CREATE INDEX IF NOT EXISTS idx_video_gallery_slug ON video_gallery(slug);
CREATE INDEX IF NOT EXISTS idx_video_gallery_category ON video_gallery(category_id);
CREATE INDEX IF NOT EXISTS idx_video_gallery_featured ON video_gallery(is_featured);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Categories
CREATE OR REPLACE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Events
CREATE OR REPLACE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- News
CREATE OR REPLACE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Photo Albums
CREATE OR REPLACE TRIGGER update_photo_albums_updated_at
  BEFORE UPDATE ON photo_albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Photo Gallery
CREATE OR REPLACE TRIGGER update_photo_gallery_updated_at
  BEFORE UPDATE ON photo_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Video Gallery
CREATE OR REPLACE TRIGGER update_video_gallery_updated_at
  BEFORE UPDATE ON video_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER TO UPDATE ALBUM PHOTO COUNT
-- =====================================================
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_albums 
    SET photo_count = photo_count + 1 
    WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_albums 
    SET photo_count = photo_count - 1 
    WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_count_on_insert
  AFTER INSERT ON photo_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_album_photo_count();

CREATE TRIGGER update_album_count_on_delete
  AFTER DELETE ON photo_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_album_photo_count();
