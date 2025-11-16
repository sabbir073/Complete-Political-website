import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/admin/settings/bulk - Bulk update settings
export async function PUT(request: NextRequest) {
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
    const { settings } = body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: settings array is required' 
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each setting update
    for (const settingUpdate of settings) {
      const { setting_key, setting_value, translations } = settingUpdate;

      if (!setting_key) {
        errors.push({ setting_key: 'unknown', error: 'setting_key is required' });
        continue;
      }

      try {
        // Get existing setting
        const { data: existingSetting, error: fetchError } = await supabase
          .from('settings')
          .select('id, setting_value')
          .eq('setting_key', setting_key)
          .single();

        if (fetchError) {
          errors.push({ setting_key, error: 'Setting not found' });
          continue;
        }

        // Create history entry
        await supabase
          .from('setting_history')
          .insert({
            setting_id: existingSetting.id,
            old_value: existingSetting.setting_value,
            new_value: setting_value,
            changed_by: user.id,
            change_reason: 'Bulk update via admin panel'
          });

        // Update the setting
        const { data: updatedSetting, error: updateError } = await supabase
          .from('settings')
          .update({
            setting_value,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', setting_key)
          .select()
          .single();

        if (updateError) {
          errors.push({ setting_key, error: 'Failed to update setting' });
          continue;
        }

        // Update translations if provided
        if (translations && Object.keys(translations).length > 0) {
          // Delete existing translations
          await supabase
            .from('setting_translations')
            .delete()
            .eq('setting_id', existingSetting.id);

          // Insert new translations
          const translationInserts = Object.entries(translations)
            .filter(([, value]) => value) // Only insert non-empty translations
            .map(([langCode, value]) => ({
              setting_id: existingSetting.id,
              language_code: langCode,
              translated_value: value
            }));

          if (translationInserts.length > 0) {
            await supabase
              .from('setting_translations')
              .insert(translationInserts);
          }
        }

        results.push({
          setting_key,
          success: true,
          data: updatedSetting
        });

      } catch (error) {
        console.error(`Error updating setting ${setting_key}:`, error);
        errors.push({ 
          setting_key, 
          error: 'Internal error during update' 
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: settings.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk settings update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}