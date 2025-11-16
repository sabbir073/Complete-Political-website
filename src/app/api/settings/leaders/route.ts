import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/settings/leaders - Public endpoint for leaders settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get leaders settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', 'home')
      .eq('subcategory', 'leader')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Public leaders settings fetch error:', error);
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

    return NextResponse.json({
      success: true,
      data: {
        category: 'leaders',
        settings: processedSettings,
        count: formattedSettings.length
      }
    });

  } catch (error) {
    console.error('Public leaders settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}