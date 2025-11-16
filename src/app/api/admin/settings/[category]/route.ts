import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    category: string;
  }>;
}

// GET /api/admin/settings/[category] - Get settings by category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
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
    const subcategory = searchParams.get('subcategory');
    const includeTranslations = searchParams.get('translations') !== 'false';

    let query = supabase
      .from('settings')
      .select(includeTranslations ? `
        *,
        setting_translations(language_code, translated_value)
      ` : '*')
      .eq('category', resolvedParams.category)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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
        // For multilingual settings, always create proper structure from translations
        const translations = setting.translations || {};
        const defaultValue = setting.default_value || effectiveValue || '';
        effectiveValue = {
          en: translations.en || defaultValue || '',
          bn: translations.bn || ''
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
        category: resolvedParams.category,
        subcategory: subcategory || null,
        settings: processedSettings,
        grouped: groupedSettings,
        count: formattedSettings.length
      }
    });

  } catch (error) {
    console.error('Category settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings/[category]/reset - Reset category to defaults
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
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
    const { subcategory, confirm } = body;

    if (!confirm) {
      return NextResponse.json({ 
        error: 'Confirmation required. Set confirm: true to proceed with reset.' 
      }, { status: 400 });
    }

    let query = supabase
      .from('settings')
      .select('id, setting_key, setting_value, default_value')
      .eq('category', resolvedParams.category)
      .eq('is_active', true);

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    const { data: settings, error: fetchError } = await query;

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
            change_reason: `Reset category ${resolvedParams.category}${subcategory ? `/${subcategory}` : ''} to defaults`
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
      message: `Reset ${resolvedParams.category}${subcategory ? `/${subcategory}` : ''} settings to defaults`,
      data: {
        category: resolvedParams.category,
        subcategory: subcategory || null,
        reset_count: resetResults.length,
        reset_settings: resetResults,
        errors: resetErrors
      }
    });

  } catch (error) {
    console.error('Settings reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}