const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default settings data extracted from settings.txt
const defaultSettings = [
  // Hero Section Settings
  {
    setting_key: 'hero_autoplay_delay',
    setting_value: 5000,
    setting_type: 'number',
    category: 'hero',
    subcategory: 'carousel',
    is_multilingual: false,
    default_value: 5000,
    description: 'Time between slide transitions in milliseconds',
    validation_rules: { min: 1000, max: 10000 },
    display_order: 1
  },
  {
    setting_key: 'hero_enable_fade_effect',
    setting_value: true,
    setting_type: 'boolean',
    category: 'hero',
    subcategory: 'carousel',
    is_multilingual: false,
    default_value: true,
    description: 'Enable/disable fade transition',
    display_order: 2
  },
  {
    setting_key: 'hero_enable_pagination',
    setting_value: true,
    setting_type: 'boolean',
    category: 'hero',
    subcategory: 'carousel',
    is_multilingual: false,
    default_value: true,
    description: 'Show/hide pagination dots',
    display_order: 3
  },
  {
    setting_key: 'hero_enable_loop',
    setting_value: true,
    setting_type: 'boolean',
    category: 'hero',
    subcategory: 'carousel',
    is_multilingual: false,
    default_value: true,
    description: 'Enable infinite loop',
    display_order: 4
  },
  {
    setting_key: 'hero_slides_count',
    setting_value: 4,
    setting_type: 'number',
    category: 'hero',
    subcategory: 'carousel',
    is_multilingual: false,
    default_value: 4,
    description: 'Number of slides to display',
    validation_rules: { min: 1, max: 10 },
    display_order: 5
  },
  // Hero Content Settings
  {
    setting_key: 'hero_slide_1_background_image',
    setting_value: '/slider/1.jpg',
    setting_type: 'image',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/slider/1.jpg',
    description: 'Background image for slide 1',
    display_order: 10
  },
  {
    setting_key: 'hero_slide_2_background_image',
    setting_value: '/slider/hero-bg-1.jpg',
    setting_type: 'image',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/slider/hero-bg-1.jpg',
    description: 'Background image for slide 2',
    display_order: 11
  },
  {
    setting_key: 'hero_slide_3_background_image',
    setting_value: '/slider/bg2.jpg',
    setting_type: 'image',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/slider/bg2.jpg',
    description: 'Background image for slide 3',
    display_order: 12
  },
  {
    setting_key: 'hero_slide_4_background_image',
    setting_value: '/slider/hero-bg-2.jpg',
    setting_type: 'image',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/slider/hero-bg-2.jpg',
    description: 'Background image for slide 4',
    display_order: 13
  },
  {
    setting_key: 'hero_person_image',
    setting_value: '/slider/leader.png',
    setting_type: 'image',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/slider/leader.png',
    description: 'Leader image for all slides',
    display_order: 14
  },
  {
    setting_key: 'hero_slide_1_title',
    setting_value: { en: 'Building a Better Tomorrow', bn: 'আরও ভাল আগামীর জন্য' },
    setting_type: 'string',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: true,
    default_value: { en: 'Building a Better Tomorrow', bn: 'আরও ভাল আগামীর জন্য' },
    description: 'Title for hero slide 1',
    display_order: 15
  },
  {
    setting_key: 'hero_slide_1_subtitle',
    setting_value: { en: 'Together we can create positive change in our community', bn: 'একসাথে আমরা আমাদের সমাজে ইতিবাচক পরিবর্তন আনতে পারি' },
    setting_type: 'string',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: true,
    default_value: { en: 'Together we can create positive change in our community', bn: 'একসাথে আমরা আমাদের সমাজে ইতিবাচক পরিবর্তন আনতে পারি' },
    description: 'Subtitle for hero slide 1',
    display_order: 16
  },
  {
    setting_key: 'hero_button_text',
    setting_value: { en: 'Learn More', bn: 'আরও জানুন' },
    setting_type: 'string',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: true,
    default_value: { en: 'Learn More', bn: 'আরও জানুন' },
    description: 'Button text for hero section',
    display_order: 20
  },
  {
    setting_key: 'hero_button_link',
    setting_value: '/about',
    setting_type: 'url',
    category: 'hero',
    subcategory: 'content',
    is_multilingual: false,
    default_value: '/about',
    description: 'Button link for hero section',
    display_order: 21
  },

  // Hero Visual Settings
  {
    setting_key: 'hero_height_mobile',
    setting_value: '70vh',
    setting_type: 'string',
    category: 'hero',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '70vh',
    description: 'Hero height on mobile devices',
    display_order: 30
  },
  {
    setting_key: 'hero_height_desktop',
    setting_value: '100vh',
    setting_type: 'string',
    category: 'hero',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '100vh',
    description: 'Hero height on desktop',
    display_order: 32
  },
  {
    setting_key: 'hero_button_primary_color_dark',
    setting_value: '#ef4444',
    setting_type: 'color',
    category: 'hero',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '#ef4444',
    description: 'Primary button color in dark theme',
    display_order: 40
  },

  // Header Settings
  {
    setting_key: 'header_position',
    setting_value: 'sticky',
    setting_type: 'string',
    category: 'header',
    subcategory: 'layout',
    is_multilingual: false,
    default_value: 'sticky',
    description: 'Header position type',
    validation_rules: { options: ['static', 'sticky', 'fixed'] },
    display_order: 1
  },
  {
    setting_key: 'header_background_dark',
    setting_value: '#111827',
    setting_type: 'color',
    category: 'header',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '#111827',
    description: 'Header background color in dark theme',
    display_order: 10
  },
  {
    setting_key: 'header_background_light',
    setting_value: '#ffffff',
    setting_type: 'color',
    category: 'header',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '#ffffff',
    description: 'Header background color in light theme',
    display_order: 11
  },
  {
    setting_key: 'header_logo_src',
    setting_value: '/logo.png',
    setting_type: 'image',
    category: 'header',
    subcategory: 'logo',
    is_multilingual: false,
    default_value: '/logo.png',
    description: 'Header logo image source',
    display_order: 20
  },
  {
    setting_key: 'header_logo_alt',
    setting_value: { en: 'S M Jahangir Hossain Logo', bn: 'এস এম জাহাঙ্গীর হোসেন লোগো' },
    setting_type: 'string',
    category: 'header',
    subcategory: 'logo',
    is_multilingual: true,
    default_value: { en: 'S M Jahangir Hossain Logo', bn: 'এস এম জাহাঙ্গীর হোসেন লোগো' },
    description: 'Header logo alt text',
    display_order: 21
  },
  {
    setting_key: 'header_logo_width',
    setting_value: 90,
    setting_type: 'number',
    category: 'header',
    subcategory: 'logo',
    is_multilingual: false,
    default_value: 90,
    description: 'Header logo width in pixels',
    validation_rules: { min: 50, max: 200 },
    display_order: 22
  },
  {
    setting_key: 'header_logo_height',
    setting_value: 60,
    setting_type: 'number',
    category: 'header',
    subcategory: 'logo',
    is_multilingual: false,
    default_value: 60,
    description: 'Header logo height in pixels',
    validation_rules: { min: 30, max: 150 },
    display_order: 23
  },
  {
    setting_key: 'header_show_language_toggle',
    setting_value: true,
    setting_type: 'boolean',
    category: 'header',
    subcategory: 'controls',
    is_multilingual: false,
    default_value: true,
    description: 'Show/hide language toggle button',
    display_order: 30
  },
  {
    setting_key: 'header_show_theme_toggle',
    setting_value: true,
    setting_type: 'boolean',
    category: 'header',
    subcategory: 'controls',
    is_multilingual: false,
    default_value: true,
    description: 'Show/hide theme toggle button',
    display_order: 31
  },
  {
    setting_key: 'header_show_whatsapp_button',
    setting_value: true,
    setting_type: 'boolean',
    category: 'header',
    subcategory: 'controls',
    is_multilingual: false,
    default_value: true,
    description: 'Show/hide WhatsApp button',
    display_order: 32
  },
  {
    setting_key: 'whatsapp_phone_number',
    setting_value: '+8801700000000',
    setting_type: 'string',
    category: 'header',
    subcategory: 'controls',
    is_multilingual: false,
    default_value: '+8801700000000',
    description: 'WhatsApp phone number',
    display_order: 33
  },
  {
    setting_key: 'whatsapp_button_text',
    setting_value: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
    setting_type: 'string',
    category: 'header',
    subcategory: 'controls',
    is_multilingual: true,
    default_value: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
    description: 'WhatsApp button text',
    display_order: 34
  },

  // Footer Settings
  {
    setting_key: 'footer_layout',
    setting_value: '5-column',
    setting_type: 'string',
    category: 'footer',
    subcategory: 'layout',
    is_multilingual: false,
    default_value: '5-column',
    description: 'Footer layout structure',
    validation_rules: { options: ['3-column', '4-column', '5-column'] },
    display_order: 1
  },
  {
    setting_key: 'footer_background_dark',
    setting_value: '#111827',
    setting_type: 'color',
    category: 'footer',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '#111827',
    description: 'Footer background color in dark theme',
    display_order: 10
  },
  {
    setting_key: 'footer_background_light',
    setting_value: '#003B2F',
    setting_type: 'color',
    category: 'footer',
    subcategory: 'visual',
    is_multilingual: false,
    default_value: '#003B2F',
    description: 'Footer background color in light theme',
    display_order: 11
  },
  {
    setting_key: 'footer_cta_title',
    setting_value: { en: 'Join Our Movement', bn: 'আমাদের আন্দোলনে যোগ দিন' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'cta',
    is_multilingual: true,
    default_value: { en: 'Join Our Movement', bn: 'আমাদের আন্দোলনে যোগ দিন' },
    description: 'Footer CTA section title',
    display_order: 20
  },
  {
    setting_key: 'footer_cta_subtitle',
    setting_value: { en: 'Be part of the change Bangladesh needs', bn: 'বাংলাদেশের যে পরিবর্তন প্রয়োজন তার অংশীদার হন' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'cta',
    is_multilingual: true,
    default_value: { en: 'Be part of the change Bangladesh needs', bn: 'বাংলাদেশের যে পরিবর্তন প্রয়োজন তার অংশীদার হন' },
    description: 'Footer CTA section subtitle',
    display_order: 21
  },
  {
    setting_key: 'footer_cta_button_text',
    setting_value: { en: 'Join Now', bn: 'এখনই যোগ দিন' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'cta',
    is_multilingual: true,
    default_value: { en: 'Join Now', bn: 'এখনই যোগ দিন' },
    description: 'Footer CTA button text',
    display_order: 22
  },
  {
    setting_key: 'footer_column_2_title',
    setting_value: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'columns',
    is_multilingual: true,
    default_value: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
    description: 'Footer column 2 title',
    display_order: 30
  },
  {
    setting_key: 'footer_column_3_title',
    setting_value: { en: 'Resources', bn: 'সংস্থান' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'columns',
    is_multilingual: true,
    default_value: { en: 'Resources', bn: 'সংস্থান' },
    description: 'Footer column 3 title',
    display_order: 31
  },
  {
    setting_key: 'footer_column_4_title',
    setting_value: { en: 'Updates', bn: 'আপডেট' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'columns',
    is_multilingual: true,
    default_value: { en: 'Updates', bn: 'আপডেট' },
    description: 'Footer column 4 title',
    display_order: 32
  },
  {
    setting_key: 'footer_column_5_title',
    setting_value: { en: 'Join Us', bn: 'আমাদের সাথে যোগ দিন' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'columns',
    is_multilingual: true,
    default_value: { en: 'Join Us', bn: 'আমাদের সাথে যোগ দিন' },
    description: 'Footer column 5 title',
    display_order: 33
  },
  {
    setting_key: 'footer_copyright_text',
    setting_value: { en: '© 2023 to 2025 Bangladesh Nationalist Party - BNP', bn: '© ২০২৩ থেকে ২০২৫ বাংলাদেশ জাতীয়তাবাদী দল - বিএনপি' },
    setting_type: 'string',
    category: 'footer',
    subcategory: 'bottom',
    is_multilingual: true,
    default_value: { en: '© 2023 to 2025 Bangladesh Nationalist Party - BNP', bn: '© ২০২৩ থেকে ২০২৫ বাংলাদেশ জাতীয়তাবাদী দল - বিএনপি' },
    description: 'Footer copyright text',
    display_order: 40
  },

  // Leaders Section Settings
  {
    setting_key: 'leaders_section_label',
    setting_value: { en: 'Our Leaders', bn: 'আমাদের নেতারা' },
    setting_type: 'string',
    category: 'leaders',
    subcategory: 'content',
    is_multilingual: true,
    default_value: { en: 'Our Leaders', bn: 'আমাদের নেতারা' },
    description: 'Leaders section label',
    display_order: 1
  },
  {
    setting_key: 'leaders_section_title',
    setting_value: { en: 'The Great Leaders', bn: 'মহান নেতারা' },
    setting_type: 'string',
    category: 'leaders',
    subcategory: 'content',
    is_multilingual: true,
    default_value: { en: 'The Great Leaders', bn: 'মহান নেতারা' },
    description: 'Leaders section title',
    display_order: 2
  },
  {
    setting_key: 'leaders_count',
    setting_value: 3,
    setting_type: 'number',
    category: 'leaders',
    subcategory: 'content',
    is_multilingual: false,
    default_value: 3,
    description: 'Number of leaders to display',
    validation_rules: { min: 1, max: 10 },
    display_order: 3
  },

  // Global Theme Settings
  {
    setting_key: 'primary_red_color',
    setting_value: '#dc2626',
    setting_type: 'color',
    category: 'theme',
    subcategory: 'colors',
    is_multilingual: false,
    default_value: '#dc2626',
    description: 'Primary red color for the theme',
    display_order: 1
  },
  {
    setting_key: 'background_dark',
    setting_value: '#111827',
    setting_type: 'color',
    category: 'theme',
    subcategory: 'colors',
    is_multilingual: false,
    default_value: '#111827',
    description: 'Background color for dark theme',
    display_order: 2
  },
  {
    setting_key: 'background_light',
    setting_value: '#ffffff',
    setting_type: 'color',
    category: 'theme',
    subcategory: 'colors',
    is_multilingual: false,
    default_value: '#ffffff',
    description: 'Background color for light theme',
    display_order: 3
  },

  // Social Media Settings
  {
    setting_key: 'facebook_url',
    setting_value: 'https://facebook.com/bnpbd',
    setting_type: 'url',
    category: 'social',
    subcategory: 'links',
    is_multilingual: false,
    default_value: 'https://facebook.com/bnpbd',
    description: 'Facebook profile URL',
    display_order: 1
  },
  {
    setting_key: 'youtube_url',
    setting_value: 'https://youtube.com/@bnpbd',
    setting_type: 'url',
    category: 'social',
    subcategory: 'links',
    is_multilingual: false,
    default_value: 'https://youtube.com/@bnpbd',
    description: 'YouTube channel URL',
    display_order: 2
  },
  {
    setting_key: 'enable_social_sharing',
    setting_value: true,
    setting_type: 'boolean',
    category: 'social',
    subcategory: 'general',
    is_multilingual: false,
    default_value: true,
    description: 'Enable social media sharing buttons',
    display_order: 10
  }
];

// Settings with translations
const settingsWithTranslations = defaultSettings.filter(setting => setting.is_multilingual);

async function seedSettings() {
  try {
    console.log('Starting settings seed...');

    // First, insert the settings
    const { data: insertedSettings, error: settingsError } = await supabase
      .from('settings')
      .insert(defaultSettings.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: setting.is_multilingual ? setting.setting_value.en : setting.setting_value,
        setting_type: setting.setting_type,
        category: setting.category,
        subcategory: setting.subcategory,
        is_multilingual: setting.is_multilingual,
        default_value: setting.is_multilingual ? setting.default_value.en : setting.default_value,
        description: setting.description,
        validation_rules: setting.validation_rules,
        display_order: setting.display_order,
        is_active: true
      })))
      .select();

    if (settingsError) {
      console.error('Error inserting settings:', settingsError);
      return;
    }

    console.log(`✅ Inserted ${insertedSettings.length} settings`);

    // Now insert translations for multilingual settings
    const translationsToInsert = [];

    for (const setting of insertedSettings) {
      const originalSetting = defaultSettings.find(s => s.setting_key === setting.setting_key);
      
      if (originalSetting?.is_multilingual && typeof originalSetting.setting_value === 'object') {
        // Add English translation
        translationsToInsert.push({
          setting_id: setting.id,
          language_code: 'en',
          translated_value: originalSetting.setting_value.en
        });

        // Add Bengali translation
        translationsToInsert.push({
          setting_id: setting.id,
          language_code: 'bn',
          translated_value: originalSetting.setting_value.bn
        });
      }
    }

    if (translationsToInsert.length > 0) {
      const { data: insertedTranslations, error: translationsError } = await supabase
        .from('setting_translations')
        .insert(translationsToInsert)
        .select();

      if (translationsError) {
        console.error('Error inserting translations:', translationsError);
        return;
      }

      console.log(`✅ Inserted ${insertedTranslations.length} translations`);
    }

    console.log('🎉 Settings seeding completed successfully!');
    console.log(`Total settings: ${insertedSettings.length}`);
    console.log(`Total translations: ${translationsToInsert.length}`);

    // Summary by category
    const categoryCount = {};
    insertedSettings.forEach(setting => {
      const category = setting.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    console.log('\n📊 Settings by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} settings`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seeding
seedSettings();