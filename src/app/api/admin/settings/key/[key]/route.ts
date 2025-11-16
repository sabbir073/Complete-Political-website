import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    key: string;
  }>;
}

// GET /api/admin/settings/key/[key] - Get specific setting
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

    // Get setting with translations
    const { data: setting, error } = await supabase
      .from('settings')
      .select(`
        *,
        setting_translations(language_code, translated_value)
      `)
      .eq('setting_key', resolvedParams.key)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      console.error('Setting fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
    }

    // Format translations
    const translations = setting.setting_translations?.reduce((acc: any, trans: any) => {
      acc[trans.language_code] = trans.translated_value;
      return acc;
    }, {}) || {};

    const settingWithTranslations = {
      ...setting,
      translations,
      setting_translations: undefined
    };

    return NextResponse.json({
      success: true,
      data: settingWithTranslations
    });

  } catch (error) {
    console.error('Setting fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/key/[key] - Update specific setting
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const {
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

    // Get existing setting
    const { data: existingSetting, error: fetchError } = await supabase
      .from('settings')
      .select('id, setting_value')
      .eq('setting_key', resolvedParams.key)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    // Create history entry
    const { error: historyError } = await supabase
      .from('setting_history')
      .insert({
        setting_id: existingSetting.id,
        old_value: existingSetting.setting_value,
        new_value: setting_value,
        changed_by: user.id,
        change_reason: 'Updated via admin panel'
      });

    if (historyError) {
      console.error('History creation error:', historyError);
      // Continue with update even if history fails
    }

    // Update the setting
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (setting_value !== undefined) updateData.setting_value = setting_value;
    if (setting_type !== undefined) updateData.setting_type = setting_type;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (is_multilingual !== undefined) updateData.is_multilingual = is_multilingual;
    if (default_value !== undefined) updateData.default_value = default_value;
    if (description !== undefined) updateData.description = description;
    if (validation_rules !== undefined) updateData.validation_rules = validation_rules;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data: updatedSetting, error: updateError } = await supabase
      .from('settings')
      .update(updateData)
      .eq('setting_key', resolvedParams.key)
      .select()
      .single();

    if (updateError) {
      console.error('Setting update error:', updateError);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
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
        const { error: translationError } = await supabase
          .from('setting_translations')
          .insert(translationInserts);

        if (translationError) {
          console.error('Translation update error:', translationError);
          // Continue with response even if translations fail
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSetting,
        translations: translations || {}
      }
    });

  } catch (error) {
    console.error('Setting update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings/key/[key] - Delete specific setting
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Soft delete (set is_active to false)
    const { data: deletedSetting, error } = await supabase
      .from('settings')
      .update({ 
        is_active: false,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', resolvedParams.key)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      console.error('Setting deletion error:', error);
      return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully',
      data: deletedSetting
    });

  } catch (error) {
    console.error('Setting deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}