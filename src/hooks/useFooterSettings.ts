import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

// Remove FooterMenuItem interface - no longer using fixed menu items

interface FooterSettings {
  // Layout settings
  footer_layout: '3-column' | '4-column' | '5-column';
  footer_cta_position: 'top' | 'bottom';
  
  // CTA settings
  footer_cta_show: boolean;
  footer_cta_title: { en: string; bn: string };
  footer_cta_subtitle: { en: string; bn: string };
  footer_cta_button_text: { en: string; bn: string };
  footer_cta_button_url: string;
  footer_cta_bg_image: string;
  
  // Visual settings
  footer_bg_color: string;
  footer_text_color: string;
  footer_border_show: boolean;
  footer_border_color: string;
  
  // Logo settings
  footer_logo_show: boolean;
  footer_logo_src: string;
  footer_logo_width: number;
  footer_logo_height: number;
  
  // Social media settings
  footer_social_show: boolean;
  footer_social_title: { en: string; bn: string };
  footer_social_youtube_url: string;
  footer_social_facebook_url: string;
  footer_social_twitter_url: string;
  footer_social_instagram_url: string;
  footer_social_telegram_url: string;
  footer_social_tiktok_url: string;
  footer_social_linkedin_url: string;
  footer_social_whatsapp_url: string;
  footer_social_discord_url: string;
  
  // Column 1: About Us
  footer_column_1_show: boolean;
  footer_column_1_title: { en: string; bn: string };
  footer_column_1_menus: Array<{
    url: string;
    text_en: string;
    text_bn: string;
  }>;
  
  // Column 2: Resources
  footer_column_2_show: boolean;
  footer_column_2_title: { en: string; bn: string };
  footer_column_2_menus: Array<{
    url: string;
    text_en: string;
    text_bn: string;
  }>;
  
  // Column 3: Updates
  footer_column_3_show: boolean;
  footer_column_3_title: { en: string; bn: string };
  footer_column_3_menus: Array<{
    url: string;
    text_en: string;
    text_bn: string;
  }>;
  
  // Column 4: Join Us
  footer_column_4_show: boolean;
  footer_column_4_title: { en: string; bn: string };
  footer_column_4_button_1_show: boolean;
  footer_column_4_button_1_text: { en: string; bn: string };
  footer_column_4_button_1_url: string;
  footer_column_4_button_2_show: boolean;
  footer_column_4_button_2_text: { en: string; bn: string };
  footer_column_4_button_2_url: string;
  footer_column_4_button_3_show: boolean;
  footer_column_4_button_3_text: { en: string; bn: string };
  footer_column_4_button_3_url: string;
  
  // Bottom section settings
  footer_bottom_show: boolean;
  footer_bottom_copyright: { en: string; bn: string };
  footer_bottom_developer: { en: string; bn: string };
  footer_bottom_developer_show: boolean;
  footer_bottom_border_color: string;
}

const defaultSettings: FooterSettings = {
  // Layout settings
  footer_layout: '5-column',
  footer_cta_position: 'top',
  
  // CTA settings
  footer_cta_show: true,
  footer_cta_title: { en: 'Join the Nationalists', bn: 'জাতীয়তাবাদীদের সাথে যুক্ত হন' },
  footer_cta_subtitle: { en: 'Join the Fight for Democracy & Voting Rights', bn: 'গণতন্ত্র ও ভোটাধিকারের লড়াইয়ে যোগ দিন' },
  footer_cta_button_text: { en: 'Join Now', bn: 'এখনই যোগ দিন' },
  footer_cta_button_url: '/join',
  footer_cta_bg_image: '/footerbg.png',
  
  // Visual settings
  footer_bg_color: '#003B2F',
  footer_text_color: '#FFFFFF',
  footer_border_show: true,
  footer_border_color: '#22C55E',
  
  // Logo settings
  footer_logo_show: true,
  footer_logo_src: '/Logo-PNG.png',
  footer_logo_width: 64,
  footer_logo_height: 48,
  
  // Social media settings
  footer_social_show: true,
  footer_social_title: { en: 'Follow us', bn: 'আমাদের অনুসরণ করুন' },
  footer_social_youtube_url: 'https://youtube.com/@bnpofficial',
  footer_social_facebook_url: 'https://facebook.com/BNPofficial',
  footer_social_twitter_url: 'https://twitter.com/BNPofficial',
  footer_social_instagram_url: 'https://instagram.com/bnpofficial',
  footer_social_telegram_url: 'https://t.me/bnpofficial',
  footer_social_tiktok_url: 'https://tiktok.com/@bnpofficial',
  footer_social_linkedin_url: '',
  footer_social_whatsapp_url: '',
  footer_social_discord_url: '',
  
  // Column 1: About Us
  footer_column_1_show: true,
  footer_column_1_title: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  footer_column_1_menus: [
    { url: '/leaders', text_en: 'Our Leaders', text_bn: 'আমাদের নেতৃত্ব' },
    { url: '/constitution', text_en: 'Constitution', text_bn: 'সংবিধান' }
  ],
  
  // Column 2: Resources
  footer_column_2_show: true,
  footer_column_2_title: { en: 'Resources', bn: 'সম্পদ' },
  footer_column_2_menus: [
    { url: '/vision-2030', text_en: 'Vision 2030', text_bn: 'ভিশন ২০৩০' },
    { url: '/19-points', text_en: '19 Points', text_bn: '১৯ দফা' }
  ],
  
  // Column 3: Updates
  footer_column_3_show: true,
  footer_column_3_title: { en: 'Updates', bn: 'আপডেট' },
  footer_column_3_menus: [
    { url: '/press-releases', text_en: 'Press Releases', text_bn: 'সংবাদ বিজ্ঞপ্তি' },
    { url: '/announcements', text_en: 'Announcements', text_bn: 'ঘোষণা' }
  ],
  
  // Column 4: Join Us
  footer_column_4_show: true,
  footer_column_4_title: { en: 'Join Us', bn: 'আমাদের সাথে যোগ দিন' },
  footer_column_4_button_1_show: true,
  footer_column_4_button_1_text: { en: 'Membership Free', bn: 'বিনামূল্যে সদস্যতা' },
  footer_column_4_button_1_url: '/membership',
  footer_column_4_button_2_show: true,
  footer_column_4_button_2_text: { en: 'General Membership Free', bn: 'বিনামূল্যে সাধারণ সদস্যতা' },
  footer_column_4_button_2_url: '/general-membership',
  footer_column_4_button_3_show: true,
  footer_column_4_button_3_text: { en: 'Donate', bn: 'দান করুন' },
  footer_column_4_button_3_url: '/donate',
  
  // Bottom section settings
  footer_bottom_show: true,
  footer_bottom_copyright: { en: '© 2023 to 2025 Bangladesh Nationalist Party - BNP', bn: '© ২০২৩ থেকে ২০২৫ বাংলাদেশ জাতীয়তাবাদী দল - বিএনপি' },
  footer_bottom_developer: { en: 'Develop And Maintained By Md Sabbir Ahmed', bn: 'উন্নয়ন ও রক্ষণাবেক্ষণে মোঃ সাব্বির আহমেদ' },
  footer_bottom_developer_show: true,
  footer_bottom_border_color: '#22C55E',
};

export const useFooterSettings = (initialSettings?: FooterSettings) => {
  // Start with initial settings if provided, otherwise null
  const [settings, setSettings] = useState<FooterSettings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Skip fetching if we already have initial settings
    if (initialSettings) {
      setSettings(initialSettings);
      setLoading(false);
      return;
    }

    const fetchFooterSettings = async () => {
      try {
        setError(null);
        
        // Fetch footer settings only
        const settingsResponse = await fetch('/api/settings/footer?translations=true');
        const settingsData = await settingsResponse.json();
        
        if (settingsData.success && settingsData.data.settings) {
          // Transform the settings array into our FooterSettings object
          const transformedSettings: Partial<FooterSettings> = {};
          
          settingsData.data.settings.forEach((setting: any) => {
            const key = setting.setting_key as keyof FooterSettings;
            const value = setting.setting_value;
            
            // Handle multilingual settings
            if (setting.is_multilingual && typeof value === 'object') {
              transformedSettings[key] = value as any;
            } else {
              transformedSettings[key] = value as any;
            }
          });
          
          // Merge with defaults to ensure all properties exist
          setSettings({ ...defaultSettings, ...transformedSettings });
        } else {
          console.warn('Failed to fetch footer settings, using defaults');
          setSettings(defaultSettings);
        }
        
      } catch (err) {
        console.error('Error fetching footer settings:', err);
        setError('Failed to load footer settings');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterSettings();
  }, [initialSettings]);

  // Helper function to get multilingual text
  const getText = (multilingualText: { en: string; bn: string }) => {
    return multilingualText[language] || multilingualText.en || '';
  };

  // Helper function to get menu items for a specific column
  const getMenuItemsByColumn = (columnNumber: number) => {
    if (!settings) return [];
    
    switch (columnNumber) {
      case 1:
        return settings.footer_column_1_menus || [];
      case 2:
        return settings.footer_column_2_menus || [];
      case 3:
        return settings.footer_column_3_menus || [];
      default:
        return [];
    }
  };

  return {
    settings,
    loading,
    error,
    getText,
    getMenuItemsByColumn
  };
};