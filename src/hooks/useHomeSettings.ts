import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

interface HomeSettings {
  // Hero Section
  home_hero_section_show: boolean;
  home_hero_overlay_opacity: number;
  home_hero_show_person_image: boolean;
  home_hero_button_show: boolean;
  home_hero_button_text: { en: string; bn: string };
  home_hero_button_url: string;
  home_hero_item_count: number;
  home_hero_show_pagination: boolean;
  
  // Dynamic Hero Items (index signature for dynamic fields)
  [key: string]: any;

  // Leader Section
  home_leader_section_show: boolean;
  home_leader_section_title: { en: string; bn: string };
  home_leader_section_subtitle: { en: string; bn: string };
  home_leader_autoplay: boolean;
  home_leader_autoplay_delay: number;
  home_leader_slides_per_view: number;
  home_leader_show_navigation: boolean;

  // Events Section
  home_events_section_show: boolean;
  home_events_section_title: { en: string; bn: string };
  home_events_section_subtitle: { en: string; bn: string };
  home_events_per_page: number;
  home_events_show_date: boolean;
  home_events_show_location: boolean;
  home_events_show_more_button: boolean;
  home_events_more_button_text: { en: string; bn: string };
  home_events_more_button_url: string;

  // About Section
  home_about_section_show: boolean;
  home_about_section_title: { en: string; bn: string };
  home_about_section_content: { en: string; bn: string };
  home_about_show_image: boolean;
  home_about_image_src: string;
  home_about_show_button: boolean;
  home_about_button_text: { en: string; bn: string };
  home_about_button_url: string;

  // Gallery Section
  home_gallery_section_show: boolean;
  home_gallery_section_title: { en: string; bn: string };
  home_gallery_section_subtitle: { en: string; bn: string };
  home_gallery_photos_per_row: number;
  home_gallery_max_photos: number;
  home_gallery_show_lightbox: boolean;
  home_gallery_show_more_button: boolean;
  home_gallery_more_button_text: { en: string; bn: string };
  home_gallery_more_button_url: string;

  // Blog Section
  home_blog_section_show: boolean;
  home_blog_section_title: { en: string; bn: string };
  home_blog_section_subtitle: { en: string; bn: string };
  home_blog_posts_per_page: number;
  home_blog_show_excerpt: boolean;
  home_blog_show_date: boolean;
  home_blog_show_author: boolean;
  home_blog_show_more_button: boolean;
  home_blog_more_button_text: { en: string; bn: string };
  home_blog_more_button_url: string;

  // Video Section
  home_video_section_show: boolean;
  home_video_section_title: { en: string; bn: string };
  home_video_section_subtitle: { en: string; bn: string };
  home_video_max_videos: number;
  home_video_videos_per_row: number;
  home_video_show_thumbnails: boolean;
  home_video_autoplay: boolean;
  home_video_show_more_button: boolean;
  home_video_more_button_text: { en: string; bn: string };
  home_video_more_button_url: string;

  // General Settings
  home_page_title: { en: string; bn: string };
  home_page_description: { en: string; bn: string };
  home_sections_order: string[];
  home_enable_animations: boolean;
  home_animation_duration: number;
}

const defaultSettings: HomeSettings = {
  // Hero Section
  home_hero_section_show: true,
  home_hero_overlay_opacity: 0.7,
  home_hero_show_person_image: true,
  home_hero_button_show: true,
  home_hero_button_text: { en: 'Learn More', bn: 'আরও জানুন' },
  home_hero_button_url: '/about',
  home_hero_item_count: 3,
  home_hero_show_pagination: true,

  // Leader Section
  home_leader_section_show: true,
  home_leader_section_title: { en: 'Great Leaders', bn: 'মহান নেতৃবৃন্দ' },
  home_leader_section_subtitle: { en: 'Our inspiring leadership throughout history', bn: 'ইতিহাস জুড়ে আমাদের অনুপ্রেরণাদায়ক নেতৃত্ব' },
  home_leader_autoplay: true,
  home_leader_autoplay_delay: 4000,
  home_leader_slides_per_view: 3,
  home_leader_show_navigation: true,

  // Events Section
  home_events_section_show: true,
  home_events_section_title: { en: 'Latest Events', bn: 'সর্বশেষ অনুষ্ঠান' },
  home_events_section_subtitle: { en: 'Stay updated with our upcoming events', bn: 'আমাদের আসন্ন অনুষ্ঠানের সাথে আপডেট থাকুন' },
  home_events_per_page: 6,
  home_events_show_date: true,
  home_events_show_location: true,
  home_events_show_more_button: true,
  home_events_more_button_text: { en: 'View All Events', bn: 'সব অনুষ্ঠান দেখুন' },
  home_events_more_button_url: '/events',

  // About Section
  home_about_section_show: true,
  home_about_section_title: { en: 'About S M Jahangir Hossain', bn: 'এস এম জাহাঙ্গীর হোসেন সম্পর্কে' },
  home_about_section_content: { en: 'Learn about our leader and his vision for Bangladesh', bn: 'আমাদের নেতা এবং বাংলাদেশের জন্য তার দৃষ্টিভঙ্গি সম্পর্কে জানুন' },
  home_about_show_image: true,
  home_about_image_src: '/about-leader.jpg',
  home_about_show_button: true,
  home_about_button_text: { en: 'Read More', bn: 'আরও পড়ুন' },
  home_about_button_url: '/about',

  // Gallery Section
  home_gallery_section_show: true,
  home_gallery_section_title: { en: 'Photo Gallery', bn: 'ছবির গ্যালারি' },
  home_gallery_section_subtitle: { en: 'Moments captured in time', bn: 'সময়ের মধ্যে বন্দী মুহূর্তগুলি' },
  home_gallery_photos_per_row: 4,
  home_gallery_max_photos: 8,
  home_gallery_show_lightbox: true,
  home_gallery_show_more_button: true,
  home_gallery_more_button_text: { en: 'View All Photos', bn: 'সব ছবি দেখুন' },
  home_gallery_more_button_url: '/gallery',

  // Blog Section
  home_blog_section_show: true,
  home_blog_section_title: { en: 'Latest News & Updates', bn: 'সর্বশেষ সংবাদ ও আপডেট' },
  home_blog_section_subtitle: { en: 'Stay informed with our latest articles', bn: 'আমাদের সর্বশেষ নিবন্ধগুলির সাথে অবগত থাকুন' },
  home_blog_posts_per_page: 6,
  home_blog_show_excerpt: true,
  home_blog_show_date: true,
  home_blog_show_author: true,
  home_blog_show_more_button: true,
  home_blog_more_button_text: { en: 'View All Posts', bn: 'সব পোস্ট দেখুন' },
  home_blog_more_button_url: '/blog',

  // Video Section
  home_video_section_show: true,
  home_video_section_title: { en: 'Video Gallery', bn: 'ভিডিও গ্যালারি' },
  home_video_section_subtitle: { en: 'Watch our latest videos and speeches', bn: 'আমাদের সর্বশেষ ভিডিও এবং বক্তৃতা দেখুন' },
  home_video_max_videos: 6,
  home_video_videos_per_row: 3,
  home_video_show_thumbnails: true,
  home_video_autoplay: false,
  home_video_show_more_button: true,
  home_video_more_button_text: { en: 'View All Videos', bn: 'সব ভিডিও দেখুন' },
  home_video_more_button_url: '/videos',

  // General Settings
  home_page_title: { en: 'Welcome to BNP Official', bn: 'বিএনপি অফিসিয়ালে স্বাগতম' },
  home_page_description: { en: 'Official website of Bangladesh Nationalist Party', bn: 'বাংলাদেশ জাতীয়তাবাদী দলের অফিসিয়াল ওয়েবসাইট' },
  home_sections_order: ['hero', 'leader', 'events', 'about', 'gallery', 'blog', 'video'],
  home_enable_animations: true,
  home_animation_duration: 300
};

export function useHomeSettings() {
  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchHomeSettings();
  }, []);

  const fetchHomeSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch settings from multiple APIs
      const [heroResponse, leadersResponse] = await Promise.all([
        fetch('/api/settings/hero?translations=true'),
        fetch('/api/settings/leaders?translations=true')
      ]);

      const allSettings: any[] = [];

      // Process hero settings
      if (heroResponse.ok) {
        const heroData = await heroResponse.json();
        if (heroData.success && heroData.data.settings) {
          allSettings.push(...heroData.data.settings);
        }
      }

      // Process leaders settings
      if (leadersResponse.ok) {
        const leadersData = await leadersResponse.json();
        if (leadersData.success && leadersData.data.settings) {
          allSettings.push(...leadersData.data.settings);
        }
      }

      // Transform the settings array into our HomeSettings object
      const transformedSettings: Partial<HomeSettings> = {};
      
      allSettings.forEach((setting: any) => {
        const key = setting.setting_key as keyof HomeSettings;
        transformedSettings[key] = setting.setting_value as any;
      });
      
      // Merge with defaults, prioritizing fetched settings
      const finalSettings = { ...defaultSettings, ...transformedSettings };
      setHomeSettings(finalSettings);

    } catch (err) {
      console.error('Error fetching home settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch home settings');
      setHomeSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchHomeSettings();
  };

  // Helper function to get text in current language
  const getText = (multilingualText: { en: string; bn: string } | string | undefined): string => {
    if (!multilingualText) return '';
    if (typeof multilingualText === 'string') {
      return multilingualText;
    }
    if (typeof multilingualText === 'object' && multilingualText !== null) {
      return multilingualText[language] || multilingualText.en || '';
    }
    return '';
  };

  return {
    homeSettings,
    loading,
    error,
    refreshSettings,
    getText
  };
}