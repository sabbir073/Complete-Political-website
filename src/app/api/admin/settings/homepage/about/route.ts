import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || profile?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const includeTranslations = searchParams.get('translations') !== 'false';

    let query = supabase.from('settings').select(includeTranslations ? `*, setting_translations(language_code, translated_value)` : '*').eq('category', 'home').eq('subcategory', 'about').eq('is_active', true).order('display_order', { ascending: true });
    const { data: settings, error } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch about settings' }, { status: 500 });

    let formattedSettings = settings || [];
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
          const newSetting = { ...setting, translations: {} };
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

    const processedSettings = formattedSettings.map((setting: any) => {
      let effectiveValue = setting.setting_value;
      if (effectiveValue === null || effectiveValue === '' || effectiveValue === '""' || (typeof effectiveValue === 'string' && effectiveValue.trim() === '')) {
        effectiveValue = setting.default_value;
      }
      if (setting.is_multilingual) {
        const translations = setting.translations || {};
        const defaultValue = setting.default_value || effectiveValue || '';
        effectiveValue = { en: translations.en || defaultValue || '', bn: translations.bn || '' };
      }
      return { ...setting, setting_value: effectiveValue };
    });

    const groupedSettings = processedSettings.reduce((acc: any, setting: any) => {
      const subcat = setting.subcategory || 'general';
      if (!acc[subcat]) acc[subcat] = [];
      acc[subcat].push(setting);
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: { category: 'home', subcategory: 'about', settings: processedSettings, grouped: groupedSettings, count: formattedSettings.length } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || profile?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { confirm } = body;
    if (!confirm) return NextResponse.json({ error: 'Confirmation required. Set confirm: true to proceed with reset.' }, { status: 400 });

    const { data: settings, error: fetchError } = await supabase.from('settings').select('id, setting_key, setting_value, default_value').eq('category', 'home').eq('subcategory', 'about').eq('is_active', true);
    if (fetchError) return NextResponse.json({ error: 'Failed to fetch settings for reset' }, { status: 500 });

    const resetResults = [], resetErrors = [];
    for (const setting of settings || []) {
      try {
        await supabase.from('setting_history').insert({ setting_id: setting.id, old_value: setting.setting_value, new_value: setting.default_value, changed_by: user.id, change_reason: 'Reset about section to defaults' });
        const { data: updatedSetting, error: updateError } = await supabase.from('settings').update({ setting_value: setting.default_value, updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', setting.id).select().single();
        if (updateError) { resetErrors.push({ setting_key: setting.setting_key, error: 'Failed to reset setting' }); continue; }
        resetResults.push({ setting_key: setting.setting_key, old_value: setting.setting_value, new_value: setting.default_value });
      } catch (error) { resetErrors.push({ setting_key: setting.setting_key, error: 'Internal error during reset' }); }
    }

    return NextResponse.json({ success: resetErrors.length === 0, message: 'Reset about section settings to defaults', data: { category: 'home', subcategory: 'about', reset_count: resetResults.length, reset_settings: resetResults, errors: resetErrors } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}