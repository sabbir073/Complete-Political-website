'use client';

import Image from 'next/image';
import { MediaItem } from '@/types/media.types';
import { useMediaSelector } from '@/components/media/MediaSelector';

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  className?: string;
  multiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
}

export default function MediaPicker({
  value,
  onChange,
  label,
  description,
  className = '',
  multiple = false,
  fileType = 'image'
}: MediaPickerProps) {
  const { openSelector, MediaSelectorComponent } = useMediaSelector();

  const handleSelect = () => {
    openSelector({
      multiple: false, // For settings, we usually want single selection
      fileType,
      title: `Select ${fileType === 'all' ? 'Media' : fileType === 'image' ? 'Image' : 'Video'}`,
      onSelect: (media) => {
        if (Array.isArray(media)) {
          // If somehow multiple items are returned, take the first one
          const selectedMedia = media[0];
          const url = selectedMedia.cloudfront_url || selectedMedia.s3_url;
          onChange(url);
        } else {
          // Single item selected
          const url = media.cloudfront_url || media.s3_url;
          onChange(url);
        }
      }
    });
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
        
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleSelect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Choose from Media Library
          </button>
          
          {(!value || value.trim() === '') && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No image selected
            </div>
          )}
          
          {value && value.trim() !== '' && (
            <div className="flex items-center space-x-3">
              <div className="relative w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Image
                  src={value}
                  alt="Selected image"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">
                  {value.includes('cloudfront') || value.includes('amazonaws') ? 
                    'Uploaded: ' + value.split('/').pop() : 
                    'Public: ' + value.split('/').pop()
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {value.includes('cloudfront') || value.includes('amazonaws') ? 
                    'From Media Library' : 
                    'From Public Folder'
                  }
                </p>
                <button
                  onClick={() => onChange('')}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current URL Input - for manual entry or editing */}
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/path/to/image.jpg or https://example.com/image.jpg"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-text"
        />
      </div>

      {/* Media Selector Modal */}
      {MediaSelectorComponent}
    </div>
  );
}