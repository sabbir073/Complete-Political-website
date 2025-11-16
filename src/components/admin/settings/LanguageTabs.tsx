'use client';

interface LanguageTabsProps {
  currentLanguage: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  hasTranslation?: { en?: boolean; bn?: boolean };
}

export default function LanguageTabs({ 
  currentLanguage, 
  onLanguageChange, 
  hasTranslation = { en: true, bn: true }
}: LanguageTabsProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 cursor-pointer ${
          currentLanguage === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        <span>English</span>
        {hasTranslation?.en && (
          <span className="text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
        {hasTranslation?.en === false && (
          <span className="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
      </button>
      
      <button
        onClick={() => onLanguageChange('bn')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 cursor-pointer ${
          currentLanguage === 'bn'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        <span>বাংলা</span>
        {hasTranslation?.bn && (
          <span className="text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
        {hasTranslation?.bn === false && (
          <span className="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
      </button>
    </div>
  );
}