// CMS Utility Functions

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'max' = 'hq'): string {
    const qualityMap = {
        default: 'default.jpg',
        hq: 'hqdefault.jpg',
        mq: 'mqdefault.jpg',
        sd: 'sddefault.jpg',
        max: 'maxresdefault.jpg',
    };

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

/**
 * Calculate read time from content (average 200 words per minute)
 */
export function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, minutes); // At least 1 minute
}

/**
 * Check if event is in the past
 */
export function isEventPast(eventDate: string | Date): boolean {
    const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
    return date < new Date();
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(eventDate: string | Date): boolean {
    return !isEventPast(eventDate);
}

/**
 * Format date for display
 */
export function formatEventDate(date: string | Date, locale: 'en' | 'bn' = 'en'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (locale === 'bn') {
        return dateObj.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date and time for display
 */
export function formatEventDateTime(date: string | Date, locale: 'en' | 'bn' = 'en'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (locale === 'bn') {
        return dateObj.toLocaleString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Get multilingual text based on current language
 */
export function getMultilingualText(
    textEn: string | null | undefined,
    textBn: string | null | undefined,
    language: 'en' | 'bn'
): string {
    if (language === 'bn' && textBn) return textBn;
    return textEn || textBn || '';
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if slug is unique (needs to be called with database check)
 */
export async function isSlugUnique(
    slug: string,
    table: string,
    excludeId?: string
): Promise<boolean> {
    // This will be implemented in the API routes with actual database check
    return true;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'draft' | 'published'): string {
    return status === 'published'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
}

/**
 * Get category type display name
 */
export function getCategoryTypeName(type: 'events' | 'news' | 'photos' | 'videos', language: 'en' | 'bn' = 'en'): string {
    const names = {
        en: {
            events: 'Events',
            news: 'News',
            photos: 'Photos',
            videos: 'Videos',
        },
        bn: {
            events: 'ইভেন্ট',
            news: 'সংবাদ',
            photos: 'ফটো',
            videos: 'ভিডিও',
        },
    };

    return names[language][type];
}

/**
 * Parse keywords from string to array
 */
export function parseKeywords(keywords: string): string[] {
    return keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
}

/**
 * Format keywords array to string
 */
export function formatKeywordsToString(keywords: string[]): string {
    return keywords.join(', ');
}
