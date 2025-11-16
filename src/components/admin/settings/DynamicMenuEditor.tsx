import { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa6';

interface MenuItem {
  url: string;
  text_en: string;
  text_bn: string;
}

interface DynamicMenuEditorProps {
  name: string;
  value: MenuItem[] | any;
  onChange: (value: MenuItem[]) => void;
  label: string;
  description?: string;
}

export default function DynamicMenuEditor({
  name,
  value,
  onChange,
  label,
  description
}: DynamicMenuEditorProps) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Parse the value if it's a string or ensure it's an array
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setItems([]);
      }
    } else if (Array.isArray(value)) {
      setItems(value);
    } else {
      setItems([]);
    }
  }, [value]);

  const handleAddItem = () => {
    const newItem: MenuItem = {
      url: '',
      text_en: '',
      text_bn: ''
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const handleItemChange = (index: number, field: keyof MenuItem, fieldValue: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: fieldValue
    };
    setItems(updatedItems);
    onChange(updatedItems);
  };

  return (
    <div className="col-span-2">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                    placeholder="/example"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Text (English)
                  </label>
                  <input
                    type="text"
                    value={item.text_en}
                    onChange={(e) => handleItemChange(index, 'text_en', e.target.value)}
                    placeholder="Menu text in English"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Text (Bengali)
                  </label>
                  <input
                    type="text"
                    value={item.text_bn}
                    onChange={(e) => handleItemChange(index, 'text_bn', e.target.value)}
                    placeholder="মেনু টেক্সট বাংলায়"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="mt-6 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                         hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                title="Remove item"
              >
                <FaMinus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg 
                   text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 
                   dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors
                   flex items-center justify-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>
    </div>
  );
}