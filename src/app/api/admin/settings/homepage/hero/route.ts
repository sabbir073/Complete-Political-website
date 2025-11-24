import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/settings/homepage/hero - Get hero section settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeTranslations = searchParams.get('translations') !== 'false';

    const query = supabase
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
      console.error('Hero settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
    }

    let formattedSettings = settings || [];

    // Format translations if included
    if (includeTranslations) {
      formattedSettings = settings?.reduce((acc: any[], setting: any) => {
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
      }, []) || [];
    }

    // Process settings to apply proper fallback logic
    const processedSettings = formattedSettings.map((setting: any) => {
      let effectiveValue = setting.setting_value;
      
      // Handle boolean settings first (don't apply null/empty logic to booleans)
      if (setting.setting_type === 'boolean') {
        // For boolean types, only use default if value is truly null/undefined
        if (effectiveValue === null || effectiveValue === undefined) {
          effectiveValue = setting.default_value !== null ? setting.default_value : false;
        }
        // Ensure boolean type
        effectiveValue = Boolean(effectiveValue);
      } else if (
        effectiveValue === null || 
        effectiveValue === '' || 
        effectiveValue === '""' ||
        (typeof effectiveValue === 'string' && effectiveValue.trim() === '')
      ) {
        effectiveValue = setting.default_value;
      }
      
      // Handle multilingual settings
      if (setting.is_multilingual && setting.translations) {
        // For multilingual settings, always create proper structure from translations
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

    // Group by subcategory for better organization
    const groupedSettings = processedSettings.reduce((acc: any, setting: any) => {
      const subcat = setting.subcategory || 'general';
      if (!acc[subcat]) {
        acc[subcat] = [];
      }
      acc[subcat].push(setting);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        category: 'home',
        subcategory: 'hero',
        settings: processedSettings,
        grouped: groupedSettings,
        count: formattedSettings.length
      }
    });

  } catch (error) {
    console.error('Hero settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings/homepage/hero/reset - Reset hero settings to defaults
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { confirm } = body;

    if (!confirm) {
      return NextResponse.json({ 
        error: 'Confirmation required. Set confirm: true to proceed with reset.' 
      }, { status: 400 });
    }

    const { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('id, setting_key, setting_value, default_value')
      .eq('category', 'home')
      .eq('subcategory', 'hero')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Settings fetch error for reset:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch settings for reset' }, { status: 500 });
    }

    const resetResults = [];
    const resetErrors = [];

    // Reset each setting to its default value
    for (const setting of settings || []) {
      try {
        // Create history entry
        await supabase
          .from('setting_history')
          .insert({
            setting_id: setting.id,
            old_value: setting.setting_value,
            new_value: setting.default_value,
            changed_by: user.id,
            change_reason: 'Reset hero section to defaults'
          });

        // Update to default value
        const { data: updatedSetting, error: updateError } = await supabase
          .from('settings')
          .update({
            setting_value: setting.default_value,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id)
          .select()
          .single();

        if (updateError) {
          resetErrors.push({ 
            setting_key: setting.setting_key, 
            error: 'Failed to reset setting' 
          });
          continue;
        }

        resetResults.push({
          setting_key: setting.setting_key,
          old_value: setting.setting_value,
          new_value: setting.default_value
        });

      } catch (error) {
        console.error(`Error resetting setting ${setting.setting_key}:`, error);
        resetErrors.push({ 
          setting_key: setting.setting_key, 
          error: 'Internal error during reset' 
        });
      }
    }

    return NextResponse.json({
      success: resetErrors.length === 0,
      message: 'Reset hero section settings to defaults',
      data: {
        category: 'home',
        subcategory: 'hero',
        reset_count: resetResults.length,
        reset_settings: resetResults,
        errors: resetErrors
      }
    });

  } catch (error) {
    console.error('Hero settings reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}