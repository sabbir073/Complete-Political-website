import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/settings/hero - Public endpoint for hero settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const includeTranslations = searchParams.get('translations') !== 'false';

    let query = supabase
      .from('settings')
      .select(includeTranslations ? `
        *,
        setting_translations(language_code, translated_value)
      ` : '*')
      .eq('category', 'home')
      .eq('subcategory', 'hero')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const { data: settings, error } = await query;

    if (error) {
      console.error('Public hero settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
    }

    let formattedSettings = settings || [];

    // Format translations if included
    if (includeTranslations) {
      formattedSettings = settings?.reduce((acc: any[], setting: any) => {
        const existingSetting = acc.find(s => s.id === setting.id);
        
        if (existingSetting) {
          existingSetting.translations = existingSetting.translations || {};
          // Handle multiple translations per setting
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
          
          // Handle multiple translations per setting
          if (setting.setting_translations && setting.setting_translations.length > 0) {
            setting.setting_translations.forEach((translation: any) => {
              newSetting.translations[translation.language_code] = translation.translated_value;
            });
          }
          
          delete newSetting.setting_translations;
          acc.push(newSetting);
        }
        
        return acc;
      }, []) || [];
    }

    // Process settings to apply proper fallback logic
    const processedSettings = formattedSettings.map((setting: any) => {
      // If setting_value is null, empty string, or JSON empty string, use default_value
      let effectiveValue = setting.setting_value;
      
      if (
        effectiveValue === null || 
        effectiveValue === '' || 
        effectiveValue === '""' ||
        (typeof effectiveValue === 'string' && effectiveValue.trim() === '')
      ) {
        effectiveValue = setting.default_value;
      }
      
      // Handle multilingual settings
      if (setting.is_multilingual) {
        if (setting.translations && typeof setting.translations === 'object') {
          // Use actual translations
          const translations = setting.translations;
          effectiveValue = {
            en: translations.en || (typeof setting.default_value === 'object' && setting.default_value ? setting.default_value.en : setting.default_value) || '',
            bn: translations.bn || (typeof setting.default_value === 'object' && setting.default_value ? setting.default_value.bn : '') || ''
          };
        } else {
          // Fallback for multilingual settings without translations
          const defaultValue = setting.default_value || effectiveValue || '';
          effectiveValue = {
            en: typeof defaultValue === 'object' ? (defaultValue.en || '') : String(defaultValue),
            bn: typeof defaultValue === 'object' ? (defaultValue.bn || '') : ''
          };
        }
      }
      
      return {
        ...setting,
        setting_value: effectiveValue
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        category: 'hero',
        settings: processedSettings,
        count: formattedSettings.length
      }
    });

  } catch (error) {
    console.error('Public hero settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}