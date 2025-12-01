'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-clean';
import { toast } from 'react-hot-toast';
import MultilingualInput from '@/components/admin/settings/MultilingualInput';
import SettingInput from '@/components/admin/settings/SettingInput';
import MediaPicker from '@/components/admin/settings/MediaPicker';
import DynamicMenuEditor from '@/components/admin/settings/DynamicMenuEditor';
import { useSweetAlert } from '@/hooks/useSweetAlert';

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

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<SettingGroup>({});
  const [originalSettings, setOriginalSettings] = useState<SettingGroup>({});
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { isAuthenticated, canAccessSettings } = useAuth();
  const router = useRouter();
  const { showConfirm, showSuccess, showError } = useSweetAlert();

  // Redirect if not authenticated or no permission
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canAccessSettings) {
      router.replace('/admin');
    }
  }, [isAuthenticated, canAccessSettings, router]);

  useEffect(() => {
    // Only fetch if authenticated and has permission
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
      const response = await fetch('/api/admin/settings/footer?translations=true');
      const data = await response.json();
      
      if (data.success) {
        const settingsData = data.data.grouped || {};
        setSettings(settingsData);
        setOriginalSettings(JSON.parse(JSON.stringify(settingsData))); // Deep copy for comparison
        setChangedFields(new Set()); // Reset changed fields
        setHasChanges(false);
      } else {
        toast.error('Failed to load footer settings');
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
      
      // Find and update the setting across all subcategories
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

    // Check if this field has actually changed from original
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

  // Helper function to get original value for comparison
  const getOriginalValue = (settingKey: string) => {
    for (const subcategory of Object.keys(originalSettings)) {
      const setting = originalSettings[subcategory]?.find(s => s.setting_key === settingKey);
      if (setting) {
        return setting.setting_value;
      }
    }
    return null;
  };

  // Helper function to deep compare values
  const isEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => isEqual(a[key], b[key]));
    }
    
    return false;
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
    const result = await showConfirm(
      'Reset to Defaults?',
      'Are you sure you want to reset all footer settings to their default values? This action cannot be undone.',
      'Yes, Reset',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settings/footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true })
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Settings Reset!', 'Footer settings have been reset to their default values.');
        setHasChanges(false);
        setChangedFields(new Set()); // Clear changed fields
        fetchSettings();
      } else {
        showError('Reset Failed', 'Failed to reset settings. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showError('Error', 'An error occurred while resetting settings. Please try again.');
    }
  };

  // Don't render if not authenticated or no permission
  if (!isAuthenticated || !canAccessSettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const subcategoryTitles: { [key: string]: string } = {
    layout: 'Layout Settings',
    cta: 'Call-to-Action Settings',
    visual: 'Visual Settings', 
    logo: 'Logo Settings',
    social: 'Social Settings',
    social_media: 'Social Media Links',
    columns: 'Column Settings',
    bottom: 'Bottom Section Settings'
  };

  const getInputComponent = (setting: Setting) => {
    const label = setting.setting_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');

    // Special handling for dynamic menu fields
    if (setting.setting_key === 'footer_column_1_menus' || 
        setting.setting_key === 'footer_column_2_menus' || 
        setting.setting_key === 'footer_column_3_menus') {
      return (
        <DynamicMenuEditor
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={label}
          description={setting.description}
        />
      );
    }

    // Special handling for footer images - use MediaPicker
    if (setting.setting_key === 'footer_logo_src' || setting.setting_key === 'footer_cta_bg_image') {
      return (
        <MediaPicker
          value={setting.setting_value}
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

    // Special handling for footer layout - use dropdown
    if (setting.setting_key === 'footer_layout') {
      return (
        <SettingInput
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={label}
          type="select"
          description={setting.description}
          options={[
            { value: '3-column', label: '3 Column Layout' },
            { value: '4-column', label: '4 Column Layout' },
            { value: '5-column', label: '5 Column Layout' }
          ]}
        />
      );
    }

    // Special handling for CTA position - use dropdown
    if (setting.setting_key === 'footer_cta_position') {
      return (
        <SettingInput
          name={setting.setting_key}
          value={setting.setting_value}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={label}
          type="select"
          description={setting.description}
          options={[
            { value: 'top', label: 'Top of Footer' },
            { value: 'bottom', label: 'Bottom of Footer' }
          ]}
        />
      );
    }

    // Multilingual inputs
    if (setting.is_multilingual) {
      return (
        <MultilingualInput
          name={setting.setting_key}
          value={typeof setting.setting_value === 'object' ? setting.setting_value : { en: setting.setting_value || '', bn: '' }}
          onChange={(value) => handleSettingChange(setting.setting_key, value)}
          label={label}
          description={setting.description}
        />
      );
    }

    // Regular inputs
    return (
      <SettingInput
        name={setting.setting_key}
        value={setting.setting_value}
        onChange={(value) => handleSettingChange(setting.setting_key, value)}
        label={label}
        type={setting.setting_type as any}
        description={setting.description}
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your website footer, content, social media links, and visual appearance.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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

      {/* Settings Groups */}
      <div className="space-y-8">
        {Object.entries(settings)
          .sort(([a], [b]) => {
            // Group social and social_media together
            const orderMap: { [key: string]: number } = {
              'layout': 1,
              'cta': 2,
              'visual': 3,
              'logo': 4,
              'social': 5,
              'social_media': 5.5,
              'columns': 6,
              'bottom': 7
            };
            return (orderMap[a] || 99) - (orderMap[b] || 99);
          })
          .map(([subcategory, subcategorySettings]) => {
            // Combine social and social_media into one section
            if (subcategory === 'social_media') {
              return null; // Skip rendering social_media separately
            }
            
            let combinedSettings = subcategorySettings;
            if (subcategory === 'social' && settings['social_media']) {
              combinedSettings = [...subcategorySettings, ...settings['social_media']];
            }
            
            return (
              <div key={subcategory} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {subcategoryTitles[subcategory] || subcategory}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {combinedSettings
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((setting) => {
                      const inputComponent = getInputComponent(setting);
                      if (!inputComponent) return null;
                      
                      return (
                        <div key={setting.setting_key}>
                          {inputComponent}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>

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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-8 py-2 rounded-lg transition-colors ${
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

      {/* Save Notice */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{changedFields.size} field{changedFields.size !== 1 ? 's' : ''} modified</span>
          </div>
        </div>
      )}
    </div>
  );
}