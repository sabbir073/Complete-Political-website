'use client';

interface SettingInputProps {
  name: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'url' | 'image' | 'select';
  description?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export default function SettingInput({
  name,
  value,
  onChange,
  label,
  type,
  description,
  required = false,
  placeholder,
  min,
  max,
  options = [],
  className = ''
}: SettingInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    
    switch (type) {
      case 'number':
        onChange(newValue ? parseFloat(newValue) : 0);
        break;
      case 'boolean':
        onChange((e.target as HTMLInputElement).checked);
        break;
      default:
        onChange(newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={String(value) || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={Boolean(value)}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : 'Enable'}
            </span>
          </label>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              name={name}
              value={String(value) || '#000000'}
              onChange={handleChange}
              className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={String(value) || ''}
              onChange={handleChange}
              placeholder={placeholder || '#000000'}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={String(value) || ''}
            onChange={handleChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
          />
        );

      case 'image':
      case 'url':
        return (
          <div className="space-y-2">
            <input
              type="url"
              name={name}
              value={String(value) || ''}
              onChange={handleChange}
              placeholder={placeholder || (type === 'image' ? '/path/to/image.jpg' : 'https://example.com')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
            />
            {type === 'image' && value && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(value)}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            name={name}
            value={String(value) || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
          />
        );
    }
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
      
      {renderInput()}
    </div>
  );
}