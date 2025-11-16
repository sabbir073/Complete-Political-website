'use client';

import { useState } from 'react';
import LanguageTabs from './LanguageTabs';

interface MultilingualInputProps {
  name: string;
  value: { en: string; bn: string };
  onChange: (value: { en: string; bn: string }) => void;
  label: string;
  type?: 'input' | 'textarea';
  placeholder?: { en?: string; bn?: string };
  required?: boolean;
  description?: string;
  className?: string;
  rows?: number;
}

export default function MultilingualInput({
  name,
  value,
  onChange,
  label,
  type = 'input',
  placeholder = {},
  required = false,
  description,
  className = '',
  rows = 4
}: MultilingualInputProps) {
  const [currentLang, setCurrentLang] = useState<'en' | 'bn'>('en');
  
  const handleChange = (newValue: string) => {
    onChange({
      ...value,
      [currentLang]: newValue
    });
  };

  // Ensure values are strings before calling trim
  const enValue = String(value?.en || '');
  const bnValue = String(value?.bn || '');
  
  const hasTranslation = {
    en: Boolean(enValue.trim()),
    bn: Boolean(bnValue.trim())
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      
      <LanguageTabs
        currentLanguage={currentLang}
        onLanguageChange={setCurrentLang}
        hasTranslation={hasTranslation}
      />
      
      {type === 'textarea' ? (
        <textarea
          name={`${name}_${currentLang}`}
          value={String(value?.[currentLang] || '')}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder?.[currentLang] || `Enter ${label.toLowerCase()} in ${currentLang === 'en' ? 'English' : 'বাংলা'}`}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
          rows={rows}
        />
      ) : (
        <input
          type="text"
          name={`${name}_${currentLang}`}
          value={String(value?.[currentLang] || '')}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder?.[currentLang] || `Enter ${label.toLowerCase()} in ${currentLang === 'en' ? 'English' : 'বাংলা'}`}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
        />
      )}
      
      {/* Translation Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex space-x-4">
          <span className={`flex items-center space-x-1 ${hasTranslation.en ? 'text-green-600' : 'text-red-500'}`}>
            <span>{hasTranslation.en ? '✓' : '✗'}</span>
            <span>English</span>
          </span>
          <span className={`flex items-center space-x-1 ${hasTranslation.bn ? 'text-green-600' : 'text-red-500'}`}>
            <span>{hasTranslation.bn ? '✓' : '✗'}</span>
            <span>বাংলা</span>
          </span>
        </div>
        
        <div className="text-gray-500 dark:text-gray-400">
          Current: {currentLang === 'en' ? 'English' : 'বাংলা'}
        </div>
      </div>
    </div>
  );
}