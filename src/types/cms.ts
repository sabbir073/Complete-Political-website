// Content Management System Types

export interface Category {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
    content_type: 'events' | 'news' | 'photos' | 'videos';
    description_en?: string;
    description_bn?: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    // Content (Multilingual)
    title_en: string;
    title_bn: string;
    description_en: string;
    description_bn: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    // Event Details
    event_date: string;
    event_end_date?: string;
    location_en?: string;
    location_bn?: string;
    // Media
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    // Organization
    category_id?: string;
    status: 'draft' | 'published';
    // SEO
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    keywords?: string[];
    // Metadata
    created_by?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    // Relations (populated)
    category?: Category;
}

export interface News {
    id: string;
    // Content (Multilingual)
    title_en: string;
    title_bn: string;
    content_en: string;
    content_bn: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    // Media
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    // Organization
    category_id?: string;
    author_name?: string;
    read_time: number;
    status: 'draft' | 'published';
    is_featured: boolean;
    // SEO
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    keywords?: string[];
    // Metadata
    created_by?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    // Relations
    category?: Category;
}

export interface PhotoAlbum {
    id: string;
    // Album Info (Multilingual)
    name_en: string;
    name_bn: string;
    description_en?: string;
    description_bn?: string;
    // Media
    cover_image?: string;
    // Organization
    category_id?: string;
    status: 'draft' | 'published';
    display_order: number;
    // SEO
    slug: string;
    // Metadata
    photo_count: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Relations
    category?: Category;
    photos?: Photo[];
}

export interface Photo {
    id: string;
    // Photo Info (Multilingual)
    title_en?: string;
    title_bn?: string;
    caption_en?: string;
    caption_bn?: string;
    description_en?: string;
    description_bn?: string;
    // Media
    image_url: string;
    thumbnail_url?: string;
    alt_text_en?: string;
    alt_text_bn?: string;
    // Organization
    album_id?: string;
    category_id?: string;
    display_order: number;
    // Metadata
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Relations
    album?: PhotoAlbum;
    category?: Category;
}

export interface Video {
    id: string;
    // Video Info (Multilingual)
    title_en: string;
    title_bn: string;
    description_en?: string;
    description_bn?: string;
    // Media
    youtube_url: string;
    youtube_id: string;
    custom_thumbnail?: string;
    // Organization
    category_id?: string;
    status: 'draft' | 'published';
    is_featured: boolean;
    display_order: number;
    // SEO
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    // Metadata
    duration?: number;
    view_count: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    // Relations
    category?: Category;
}

// Form types for create/update operations
export interface CreateEventDTO {
    title_en: string;
    title_bn: string;
    description_en: string;
    description_bn: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    event_date: string;
    event_end_date?: string;
    location_en?: string;
    location_bn?: string;
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    category_id?: string;
    status: 'draft' | 'published';
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    keywords?: string[];
}

export interface CreateNewsDTO {
    title_en: string;
    title_bn: string;
    content_en: string;
    content_bn: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    category_id?: string;
    author_name?: string;
    read_time?: number;
    status: 'draft' | 'published';
    is_featured?: boolean;
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    keywords?: string[];
}

export interface CreatePhotoAlbumDTO {
    name_en: string;
    name_bn: string;
    description_en?: string;
    description_bn?: string;
    cover_image?: string;
    category_id?: string;
    status: 'draft' | 'published';
    display_order?: number;
    slug: string;
}

export interface CreatePhotoDTO {
    title_en?: string;
    title_bn?: string;
    caption_en?: string;
    caption_bn?: string;
    description_en?: string;
    description_bn?: string;
    image_url: string;
    thumbnail_url?: string;
    alt_text_en?: string;
    alt_text_bn?: string;
    album_id?: string;
    category_id?: string;
    display_order?: number;
}

export interface CreateVideoDTO {
    title_en: string;
    title_bn: string;
    description_en?: string;
    description_bn?: string;
    youtube_url: string;
    custom_thumbnail?: string;
    category_id?: string;
    status: 'draft' | 'published';
    is_featured?: boolean;
    display_order?: number;
    meta_title_en?: string;
    meta_title_bn?: string;
    meta_description_en?: string;
    meta_description_bn?: string;
    slug: string;
    duration?: number;
}

export interface CreateCategoryDTO {
    name_en: string;
    name_bn: string;
    slug: string;
    content_type: 'events' | 'news' | 'photos' | 'videos';
    description_en?: string;
    description_bn?: string;
    display_order?: number;
    is_active?: boolean;
}

// Update DTOs (partial versions)
export type UpdateEventDTO = Partial<CreateEventDTO>;
export type UpdateNewsDTO = Partial<CreateNewsDTO>;
export type UpdatePhotoAlbumDTO = Partial<CreatePhotoAlbumDTO>;
export type UpdatePhotoDTO = Partial<CreatePhotoDTO>;
export type UpdateVideoDTO = Partial<CreateVideoDTO>;
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
