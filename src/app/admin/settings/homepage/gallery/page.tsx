'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-clean';
import { toast } from 'react-hot-toast';
import MultilingualInput from '@/components/admin/settings/MultilingualInput';
import SettingInput from '@/components/admin/settings/SettingInput';
import MediaPicker from '@/components/admin/settings/MediaPicker';
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

export default function GallerySettingsPage() {
  const [settings, setSettings] = useState<SettingGroup>({});
  const [originalSettings, setOriginalSettings] = useState<SettingGroup>({});
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { isAuthenticated, canAccessSettings } = useAuth();
  const router = useRouter();
  const { showConfirm, showSuccess, showError } = useSweetAlert();

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

  useEffect(() => {
    setHasChanges(changedFields.size > 0);
  }, [changedFields]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/homepage/gallery?translations=true');
      const data = await response.json();
      
      if (data.success) {
        const settingsData = data.data.grouped || {};
        setSettings(settingsData);
        setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
        setChangedFields(new Set());
        setHasChanges(false);
      } else {
        toast.error('Failed to load photo gallery settings');
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
      if (setting) {
        return setting.setting_value;
      }
    }
    return null;
  };

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
      const settingsToUpdate: any[] = [];
      
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
        setChangedFields(new Set());
        fetchSettings();
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
      'Are you sure you want to reset all photo gallery settings to their default values? This action cannot be undone.',
      'Yes, Reset',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settings/homepage/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true })
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Settings Reset!', 'Photo gallery settings have been reset to their default values.');
        setHasChanges(false);
        setChangedFields(new Set());
        fetchSettings();
      } else {
        showError('Reset Failed', 'Failed to reset settings. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showError('Error', 'An error occurred while resetting settings. Please try again.');
    }
  };

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
    content: 'Content Settings',
    visual: 'Visual Settings', 
    layout: 'Layout Settings',
    display: 'Display Options',
    filtering: 'Filtering Options'
  };

  const getInputComponent = (setting: Setting) => {
    const label = setting.setting_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');

    if (setting.setting_key.includes('image') && setting.setting_type === 'text') {
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

    if (setting.is_multilingual) {
      // Ensure the value is properly formatted with string values
      let multilingualValue;
      if (typeof setting.setting_value === 'object' && setting.setting_value !== null) {
        multilingualValue = {
          en: String(setting.setting_value.en || ''),
          bn: String(setting.setting_value.bn || '')
        };
      } else {
        multilingualValue = { 
          en: String(setting.setting_value || ''), 
          bn: '' 
        };
      }
      
      return (
        <MultilingualInput
          name={setting.setting_key}
          value={multilingualValue}
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
        />
      );
    }

    return (
      <SettingInput
        name={setting.setting_key}
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
        type={setting.setting_type as any}
        description={setting.description}
      />
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo Gallery Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure the photo gallery section including layout, filters, and display options.
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

      <div className="space-y-8">
        {Object.entries(settings).map(([subcategory, subcategorySettings]) => (
          <div key={subcategory} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {subcategoryTitles[subcategory] || subcategory}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subcategorySettings
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
        ))}
      </div>

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