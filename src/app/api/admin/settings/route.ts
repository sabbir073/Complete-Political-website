import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/settings - Get all settings with optional filtering
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
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const isMultilingual = searchParams.get('multilingual');

    let query = supabase
      .from('settings')
      .select(`
        *,
        setting_translations!inner(language_code, translated_value)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    if (isMultilingual) {
      query = query.eq('is_multilingual', isMultilingual === 'true');
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Group translations by setting
    const settingsWithTranslations = settings?.reduce((acc: any[], setting: any) => {
      const existingSetting = acc.find(s => s.id === setting.id);
      
      if (existingSetting) {
        existingSetting.translations = existingSetting.translations || {};
        if (setting.setting_translations?.[0]) {
          existingSetting.translations[setting.setting_translations[0].language_code] = 
            setting.setting_translations[0].translated_value;
        }
      } else {
        const newSetting = {
          ...setting,
          translations: {}
        };
        
        if (setting.setting_translations?.[0]) {
          newSetting.translations[setting.setting_translations[0].language_code] = 
            setting.setting_translations[0].translated_value;
        }
        
        delete newSetting.setting_translations;
        acc.push(newSetting);
      }
      
      return acc;
    }, []) || [];

    return NextResponse.json({
      success: true,
      data: settingsWithTranslations,
      count: settingsWithTranslations.length
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create new setting
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
    const {
      setting_key,
      setting_value,
      setting_type,
      category,
      subcategory,
      is_multilingual,
      default_value,
      description,
      validation_rules,
      display_order,
      translations
    } = body;

    // Validate required fields
    if (!setting_key || !setting_type || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: setting_key, setting_type, category' 
      }, { status: 400 });
    }

    // Create the setting
    const { data: newSetting, error: settingError } = await supabase
      .from('settings')
      .insert({
        setting_key,
        setting_value,
        setting_type,
        category,
        subcategory,
        is_multilingual: is_multilingual || false,
        default_value,
        description,
        validation_rules,
        display_order: display_order || 0,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (settingError) {
      console.error('Setting creation error:', settingError);
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
    }

    // Create translations if provided
    if (translations && Object.keys(translations).length > 0) {
      const translationInserts = Object.entries(translations).map(([langCode, value]) => ({
        setting_id: newSetting.id,
        language_code: langCode,
        translated_value: value
      }));

      const { error: translationError } = await supabase
        .from('setting_translations')
        .insert(translationInserts);

      if (translationError) {
        console.error('Translation creation error:', translationError);
        // Note: We don't fail the request if translations fail
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newSetting,
        translations: translations || {}
      }
    });

  } catch (error) {
    console.error('Settings creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}