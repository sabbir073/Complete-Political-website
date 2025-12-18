import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

interface HeaderSettings {
  // Logo settings
  header_logo_light: string;
  header_logo_dark: string;
  header_logo_alt: { en: string; bn: string };
  header_logo_width: number;
  header_logo_height: number;
  
  // Position and styling
  header_position: 'static' | 'sticky' | 'fixed' | 'relative';
  header_background_light: string;
  header_background_dark: string;
  
  // Control visibility
  header_show_language_toggle: boolean;
  header_show_theme_toggle: boolean;
  header_show_whatsapp_button: boolean;
  header_show_contact_button: boolean;
  
  // Button content
  whatsapp_button_text: { en: string; bn: string };
  whatsapp_phone_number: string;
  contact_button_text: { en: string; bn: string };
  contact_button_link: string;
  contact_button_background: string;
  contact_button_hover_background: string;
}

const defaultSettings: HeaderSettings = {
  header_logo_light: '/Logo-PNG.png',
  header_logo_dark: '/Logo-PNG.png',
  header_logo_alt: { en: 'S M Jahangir Hossain Logo', bn: 'এস এম জাহাঙ্গীর হোসেন লোগো' },
  header_logo_width: 90,
  header_logo_height: 60,
  header_position: 'sticky',
  header_background_light: '#ffffff',
  header_background_dark: '#111827',
  // Set these to match current database values to prevent FOUC
  header_show_language_toggle: false,
  header_show_theme_toggle: false,
  header_show_whatsapp_button: true,
  header_show_contact_button: true,
  whatsapp_button_text: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
  whatsapp_phone_number: '+8801700000000',
  contact_button_text: { en: 'Contact Us', bn: 'যোগাযোগ' },
  contact_button_link: '/contact',
  contact_button_background: 'from-red-600 to-red-700',
  contact_button_hover_background: 'from-red-700 to-red-800'
};

export const useHeaderSettings = (initialSettings?: HeaderSettings) => {
  // Start with initial settings if provided, otherwise null
  const [settings, setSettings] = useState<HeaderSettings | null>(initialSettings || null);
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

    const fetchHeaderSettings = async () => {
      try {
        setError(null);
        
        const response = await fetch('/api/settings/header?translations=true');
        const data = await response.json();
        
        if (data.success && data.data.settings) {
          // Transform the settings array into our HeaderSettings object
          const transformedSettings: Partial<HeaderSettings> = {};
          
          data.data.settings.forEach((setting: any) => {
            const key = setting.setting_key as keyof HeaderSettings;
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
          console.warn('Failed to fetch header settings, using defaults');
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Error fetching header settings:', err);
        setError('Failed to load header settings');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderSettings();
  }, [initialSettings]);

  // Helper function to get multilingual text
  const getText = (multilingualText: { en: string; bn: string }) => {
    return multilingualText[language] || multilingualText.en || '';
  };

  return {
    settings,
    loading,
    error,
    getText
  };
};