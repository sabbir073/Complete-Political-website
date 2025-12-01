'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-clean';
import { toast } from 'react-hot-toast';
import MultilingualInput from '@/components/admin/settings/MultilingualInput';
import SettingInput from '@/components/admin/settings/SettingInput';
import MediaPicker from '@/components/admin/settings/MediaPicker';

interface Setting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category: string;
  subcategory: string;
  is_multilingual: boolean;
  description: string;
  display_order: number;
  translations?: { [key: string]: string };
}

interface SettingGroup {
  [subcategory: string]: Setting[];
}

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<SettingGroup>({});
  const [originalSettings, setOriginalSettings] = useState<SettingGroup>({});
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { isAuthenticated, canAccessSettings } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canAccessSettings) {
      router.replace('/admin');
    }
  }, [isAuthenticated, canAccessSettings, router]);

  useEffect(() => {
    if (isAuthenticated && canAccessSettings) {
      fetchSettings();
    }
  }, [isAuthenticated, canAccessSettings]);

  // Update hasChanges when changedFields changes
  useEffect(() => {
    setHasChanges(changedFields.size > 0);
  }, [changedFields]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/homepage/hero?translations=true');
      const data = await response.json();
      
      if (data.success) {
        const settingsData = data.data?.grouped || {};
        
        // Sanitize setting values to ensure proper data types
        Object.keys(settingsData).forEach(subcategory => {
          settingsData[subcategory] = settingsData[subcategory].map((setting: any) => {
            let sanitizedValue = setting.setting_value;
            
            // Handle boolean fields FIRST
            if (setting.setting_type === 'boolean') {
              sanitizedValue = Boolean(sanitizedValue);
            }
            // Handle null/undefined values for non-boolean fields
            else if (sanitizedValue === null || sanitizedValue === undefined) {
              sanitizedValue = setting.is_multilingual ? { en: '', bn: '' } : '';
            }
            // Handle image fields specifically - ensure they're strings
            else if (setting.setting_key.includes('_image') || setting.setting_key.includes('_src')) {
              sanitizedValue = typeof sanitizedValue === 'string' ? sanitizedValue : '';
            }
            // Handle multilingual fields - ensure proper object structure
            else if (setting.is_multilingual) {
              if (typeof sanitizedValue === 'object' && sanitizedValue !== null) {
                // Ensure it has en and bn properties
                sanitizedValue = {
                  en: String(sanitizedValue.en || ''),
                  bn: String(sanitizedValue.bn || '')
                };
              } else {
                // Convert non-object values to proper multilingual object
                sanitizedValue = { 
                  en: String(sanitizedValue || ''), 
                  bn: '' 
                };
              }
            }
            
            return {
              ...setting,
              setting_value: sanitizedValue
            };
          });
        });
        
        setSettings(settingsData);
        setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
        setChangedFields(new Set());
        setHasChanges(false);
      } else {
        toast.error('Failed to load hero section settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingKey: string, value: any) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      
      // Find and update the setting
      Object.keys(newSettings).forEach(subcategory => {
        const settingIndex = newSettings[subcategory].findIndex(s => s.setting_key === settingKey);
        if (settingIndex !== -1) {
          newSettings[subcategory][settingIndex] = {
            ...newSettings[subcategory][settingIndex],
            setting_value: value,
            translations: newSettings[subcategory][settingIndex].is_multilingual ? value : undefined
          };
        }
      });
      
      return newSettings;
    });

    // Check if value has changed from original
    const originalValue = getOriginalValue(settingKey);
    const hasChanged = !isEqual(value, originalValue);
    
    setChangedFields(prev => {
      const newSet = new Set(prev);
      if (hasChanged) {
        newSet.add(settingKey);
      } else {
        newSet.delete(settingKey);
      }
      return newSet;
    });
  };

  const getOriginalValue = (settingKey: string) => {
    for (const subcategory of Object.keys(originalSettings)) {
      const setting = originalSettings[subcategory]?.find(s => s.setting_key === settingKey);
      if (setting) return setting.setting_value;
    }
    return null;
  };

  const isEqual = (a: any, b: any): boolean => {
    // Strict equality check first
    if (a === b) return true;
    
    // Handle null/undefined cases
    if (a == null || b == null) return a === b;
    
    // Handle boolean comparisons (important for checkboxes)
    if (typeof a === 'boolean' || typeof b === 'boolean') {
      return Boolean(a) === Boolean(b);
    }
    
    // Type check
    if (typeof a !== typeof b) return false;
    
    // Object comparison
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => isEqual(a[key], b[key]));
    }
    
    return false;
  };

  const handleItemCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 10) return;
    
    handleSettingChange('home_hero_item_count', newCount);
    
    // Get current count
    const currentCount = Object.values(settings).flat()
      .find(s => s.setting_key === 'home_hero_item_count')?.setting_value || 3;
    
    if (newCount > currentCount) {
      // Add new items
      setSettings(prevSettings => {
        const newSettings = { ...prevSettings };
        const heroSubcategory = newSettings.hero || [];
        
        for (let i = currentCount + 1; i <= newCount; i++) {
          const newFields = [
            {
              id: `new-${i}-bg`,
              setting_key: `home_hero_item_${i}_background_image`,
              setting_value: '',
              setting_type: 'text',
              category: 'home_hero',
              subcategory: 'hero',
              is_multilingual: false,
              description: `Background image for hero item ${i}`,
              display_order: 100 + (i * 10)
            },
            {
              id: `new-${i}-person`,
              setting_key: `home_hero_item_${i}_person_image`,
              setting_value: '',
              setting_type: 'text',
              category: 'home_hero',
              subcategory: 'hero',
              is_multilingual: false,
              description: `Person image for hero item ${i}`,
              display_order: 101 + (i * 10)
            },
            {
              id: `new-${i}-title`,
              setting_key: `home_hero_item_${i}_title`,
              setting_value: { en: `Hero ${i} Title`, bn: `হিরো ${i} শিরোনাম` },
              setting_type: 'text',
              category: 'home_hero',
              subcategory: 'hero',
              is_multilingual: true,
              description: `Title for hero item ${i}`,
              display_order: 102 + (i * 10)
            },
            {
              id: `new-${i}-desc`,
              setting_key: `home_hero_item_${i}_description`,
              setting_value: { en: `Hero ${i} description`, bn: `হিরো ${i} বিবরণ` },
              setting_type: 'textarea',
              category: 'home_hero',
              subcategory: 'hero',
              is_multilingual: true,
              description: `Description for hero item ${i}`,
              display_order: 103 + (i * 10)
            }
          ];
          
          // Check if fields already exist
          const existingKeys = heroSubcategory.map(s => s.setting_key);
          const fieldsToAdd = newFields.filter(f => !existingKeys.includes(f.setting_key));
          heroSubcategory.push(...fieldsToAdd);
        }
        
        newSettings.hero = heroSubcategory;
        return newSettings;
      });
    } else if (newCount < currentCount) {
      // Remove excess items
      setSettings(prevSettings => {
        const newSettings = { ...prevSettings };
        Object.keys(newSettings).forEach(subcategory => {
          newSettings[subcategory] = newSettings[subcategory].filter(setting => {
            const match = setting.setting_key.match(/home_hero_item_(\d+)_/);
            if (match) {
              const itemNumber = parseInt(match[1]);
              return itemNumber <= newCount;
            }
            return true;
          });
        });
        return newSettings;
      });
    }
  };

  const handleSave = async () => {
    if (!hasChanges || changedFields.size === 0) return;
    
    setSaving(true);
    try {
      // Prepare only changed settings for bulk update
      const settingsToUpdate: any[] = [];
      
      // Only process settings that have changed
      Object.values(settings).flat().forEach(setting => {
        if (changedFields.has(setting.setting_key)) {
          settingsToUpdate.push({
            setting_key: setting.setting_key,
            setting_value: setting.is_multilingual 
              ? (typeof setting.setting_value === 'object' ? setting.setting_value.en : setting.setting_value)
              : setting.setting_value,
            translations: setting.is_multilingual && typeof setting.setting_value === 'object' 
              ? setting.setting_value 
              : undefined
          });
        }
      });

      if (settingsToUpdate.length === 0) {
        toast('No changes to save');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/settings/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Saved ${settingsToUpdate.length} changed setting${settingsToUpdate.length !== 1 ? 's' : ''} successfully!`);
        setHasChanges(false);
        setChangedFields(new Set()); // Clear changed fields
        fetchSettings(); // Refresh data
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all hero settings to their default values? This action cannot be undone.'
    );

    if (confirmed) {
      await fetchSettings();
      setHasChanges(false);
      setChangedFields(new Set());
      toast.success('Hero settings reset to defaults');
    }
  };

  const getInputComponent = (setting: Setting) => {
    const label = setting.setting_key
      .replace('home_hero_', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    // Handle item count specially
    if (setting.setting_key === 'home_hero_item_count') {
      return (
        <SettingInput
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleItemCountChange(parseInt(String(value)) || 1)}
          label="Number of Hero Items"
          description="How many hero slides to display (1-10)"
          type="number"
          min={1}
          max={10}
        />
      );
    }

    // Handle boolean fields BEFORE image fields to avoid conflicts
    if (setting.setting_type === 'boolean' || 
        setting.setting_key === 'home_hero_show_person_image' || 
        setting.setting_key === 'home_hero_section_show' ||
        setting.setting_key === 'home_hero_button_show' ||
        setting.setting_key === 'home_hero_show_pagination') {
      
      // Custom labels for better clarity
      let customLabel = label;
      if (setting.setting_key === 'home_hero_show_person_image') {
        customLabel = 'Show Person Image';
      } else if (setting.setting_key === 'home_hero_show_pagination') {
        customLabel = 'Show Pagination Dots';
      } else if (setting.setting_key === 'home_hero_button_show') {
        customLabel = 'Show Button';
      } else if (setting.setting_key === 'home_hero_section_show') {
        customLabel = 'Enable Hero Section';
      }
      
      return (
        <SettingInput
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={customLabel}
          description={setting.description || 'Enable or disable this feature'}
          type="boolean"
        />
      );
    }

    // Handle actual image uploads with MediaPicker (but exclude boolean "show" fields)
    if ((setting.setting_key.includes('_image') || setting.setting_key.includes('_src')) && 
        !setting.setting_key.includes('show_') && 
        setting.setting_type !== 'boolean') {
      // Ensure value is always a string for MediaPicker - handle all possible data types
      let imageValue = '';
      if (setting.setting_value !== null && setting.setting_value !== undefined) {
        if (typeof setting.setting_value === 'string') {
          imageValue = setting.setting_value;
        } else if (typeof setting.setting_value === 'object' && setting.setting_value.en) {
          // In case it's accidentally stored as multilingual
          imageValue = setting.setting_value.en;
        } else {
          // Convert any other type to string
          imageValue = String(setting.setting_value);
        }
      }
      
      return (
        <MediaPicker
          value={imageValue}
          onChange={(media: any) => {
            // Extract URL from MediaItem
            const url = media
              ? Array.isArray(media)
                ? media[0]?.cloudfront_url || media[0]?.s3_url || ''
                : media.cloudfront_url || media.s3_url || ''
              : '';
            handleSettingChange(setting.setting_key, url);
          }}
          label={label}
          description={setting.description}
          fileType="image"
        />
      );
    }

    // Handle multilingual fields
    if (setting.is_multilingual) {
      // Ensure the value is a proper multilingual object for MultilingualInput
      let multilingualValue = setting.setting_value;
      if (typeof multilingualValue !== 'object' || multilingualValue === null) {
        multilingualValue = { en: String(multilingualValue || ''), bn: '' };
      } else if (!multilingualValue.en && !multilingualValue.bn) {
        multilingualValue = { en: '', bn: '' };
      }

      return (
        <MultilingualInput
          name={setting.setting_key}
          label={label}
          value={multilingualValue}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          type={setting.setting_type === 'textarea' ? 'textarea' : 'input'}
          rows={setting.setting_type === 'textarea' ? 3 : undefined}
        />
      );
    }


    // Handle number fields
    if (setting.setting_type === 'number') {
      return (
        <SettingInput
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={label}
          description={setting.description}
          type="number"
          min={setting.setting_key.includes('opacity') ? 0 : undefined}
          max={setting.setting_key.includes('opacity') ? 1 : undefined}
        />
      );
    }

    // Default text input
    return (
      <SettingInput
        name={setting.setting_key}
        value={setting.setting_value}
        onChange={(value) => handleSettingChange(setting.setting_key, value)}
        label={label}
        description={setting.description}
        type="string"
      />
    );
  };

  // Organize settings for display
  const organizeSettings = () => {
    const allSettings = Object.values(settings).flat();
    
    // General settings (non-item specific)
    const generalSettings = allSettings.filter(s => 
      !s.setting_key.match(/home_hero_item_\d+_/)
    ).sort((a, b) => a.display_order - b.display_order);
    
    // Hero items
    const heroItemCount = allSettings.find(s => s.setting_key === 'home_hero_item_count')?.setting_value || 3;
    const heroItems: { [key: number]: Setting[] } = {};
    
    for (let i = 1; i <= heroItemCount; i++) {
      heroItems[i] = allSettings.filter(s => 
        s.setting_key.startsWith(`home_hero_item_${i}_`)
      ).sort((a, b) => a.display_order - b.display_order);
    }
    
    return { generalSettings, heroItems };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { generalSettings, heroItems } = organizeSettings();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Section Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your homepage hero section with dynamic slides and animations.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded-lg transition-colors ${
              hasChanges && !saving
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          General Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalSettings.map((setting) => {
            const inputComponent = getInputComponent(setting);
            if (!inputComponent) return null;
            
            // Full width for certain fields
            const fullWidth = setting.is_multilingual || 
                            setting.setting_key === 'home_hero_button_url';
            
            return (
              <div 
                key={setting.setting_key} 
                className={fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}
              >
                {inputComponent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Items */}
      {Object.entries(heroItems).map(([itemNumber, itemSettings]) => (
        <div key={`hero-item-${itemNumber}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Hero Slide {itemNumber}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {itemSettings.map((setting) => {
              const inputComponent = getInputComponent(setting);
              if (!inputComponent) return null;
              
              // Full width for multilingual fields
              const fullWidth = setting.is_multilingual;
              
              return (
                <div 
                  key={setting.setting_key} 
                  className={fullWidth ? 'md:col-span-2 lg:col-span-2' : ''}
                >
                  {inputComponent}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom Save Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hasChanges ? (
              <span className="text-orange-600 dark:text-orange-400">
                {changedFields.size} field{changedFields.size !== 1 ? 's' : ''} modified - unsaved changes
              </span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-6 py-2 rounded-lg transition-colors ${
                hasChanges && !saving
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}