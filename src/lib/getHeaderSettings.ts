import { createClient } from '@/lib/supabase/server';

export interface HeaderSettings {
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
  header_show_language_toggle: true,
  header_show_theme_toggle: true,
  header_show_whatsapp_button: true,
  header_show_contact_button: true,
  whatsapp_button_text: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
  whatsapp_phone_number: '+8801700000000',
  contact_button_text: { en: 'Contact Us', bn: 'যোগাযোগ' },
  contact_button_link: '/contact',
  contact_button_background: 'from-red-600 to-red-700',
  contact_button_hover_background: 'from-red-700 to-red-800'
};

export async function getHeaderSettings(): Promise<HeaderSettings> {
  try {
    const supabase = await createClient();
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select(`
        *,
        setting_translations(language_code, translated_value)
      `)
      .eq('category', 'header')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching header settings:', error);
      return defaultSettings;
    }

    if (!settings || settings.length === 0) {
      return defaultSettings;
    }

    // Format translations
    const formattedSettings = settings.reduce((acc: any[], setting: any) => {
      const existingSetting = acc.find(s => s.id === setting.id);
      
      if (existingSetting) {
        existingSetting.translations = existingSetting.translations || {};
        if (setting.setting_translations && setting.setting_translations.length > 0) {
          setting.setting_translations.forEach((translation: any) => {
            existingSetting.translations[translation.language_code] = translation.translated_value;
          });
        }
      } else {
        const newSetting = {
          ...setting,
          translations: {}
        };
        
        if (setting.setting_translations && setting.setting_translations.length > 0) {
          setting.setting_translations.forEach((translation: any) => {
            newSetting.translations[translation.language_code] = translation.translated_value;
          });
        }
        
        delete newSetting.setting_translations;
        acc.push(newSetting);
      }
      
      return acc;
    }, []);

    // Process settings with fallback logic
    const processedSettings = formattedSettings.map((setting: any) => {
      let effectiveValue = setting.setting_value;
      
      if (
        effectiveValue === null || 
        effectiveValue === '' || 
        effectiveValue === '""' ||
        (typeof effectiveValue === 'string' && effectiveValue.trim() === '')
      ) {
        effectiveValue = setting.default_value;
      }
      
      if (setting.is_multilingual && setting.translations) {
        const translations = setting.translations;
        effectiveValue = {
          en: translations.en || (typeof setting.default_value === 'object' ? setting.default_value.en : setting.default_value) || '',
          bn: translations.bn || (typeof setting.default_value === 'object' ? setting.default_value.bn : '') || ''
        };
      }
      
      return {
        ...setting,
        setting_value: effectiveValue
      };
    });

    // Transform to HeaderSettings object
    const result: Partial<HeaderSettings> = {};
    
    processedSettings.forEach((setting: any) => {
      const key = setting.setting_key as keyof HeaderSettings;
      result[key] = setting.setting_value as any;
    });

    // Merge with defaults to ensure all properties exist
    return { ...defaultSettings, ...result };

  } catch (error) {
    console.error('Error in getHeaderSettings:', error);
    return defaultSettings;
  }
}