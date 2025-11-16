import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/settings/homepage/leaders - Get leaders section settings
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

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', 'home')
      .eq('subcategory', 'leader')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Leaders settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaders settings' }, { status: 500 });
    }

    let formattedSettings = settings || [];

    // Process settings to apply proper fallback logic (same as Hero API)
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
      
      // Handle multilingual settings (same as Hero API)
      if (setting.is_multilingual) {
        if (typeof effectiveValue === 'object' && effectiveValue !== null) {
          // Already a multilingual object, use as-is
          effectiveValue = {
            en: effectiveValue.en || (typeof setting.default_value === 'object' && setting.default_value ? setting.default_value.en : setting.default_value) || '',
            bn: effectiveValue.bn || (typeof setting.default_value === 'object' && setting.default_value ? setting.default_value.bn : '') || ''
          };
        } else {
          // Fallback for multilingual settings without proper structure
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
        subcategory: 'leader',
        settings: processedSettings,
        grouped: groupedSettings,
        count: formattedSettings.length
      }
    });

  } catch (error) {
    console.error('Leaders settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings/homepage/leaders/reset - Reset leaders settings to defaults
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
      .eq('subcategory', 'leader')
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
            change_reason: 'Reset leaders section to defaults'
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
      message: 'Reset leaders section settings to defaults',
      data: {
        category: 'home',
        subcategory: 'leader',
        reset_count: resetResults.length,
        reset_settings: resetResults,
        errors: resetErrors
      }
    });

  } catch (error) {
    console.error('Leaders settings reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}