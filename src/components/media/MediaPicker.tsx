"use client";

import { useState } from 'react';
import Image from 'next/image';
import { MediaItem } from '@/types/media.types';
import { useTheme } from '@/providers/ThemeProvider';
import { formatFileSize } from '@/lib/media-utils';
import { useMediaSelector } from './MediaSelector';

interface MediaPickerProps {
  value?: MediaItem | MediaItem[] | string | null;
  onChange: (media: MediaItem | MediaItem[] | null) => void;
  multiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
  placeholder?: string;
  className?: string;
  maxSelections?: number;
  allowRemove?: boolean;
  showPreview?: boolean;
}

export default function MediaPicker({
  value,
  onChange,
  multiple = false,
  fileType = 'all',
  placeholder,
  className = '',
  maxSelections,
  allowRemove = true,
  showPreview = true
}: MediaPickerProps) {
  const { isDark } = useTheme();
  const { openSelector, MediaSelectorComponent } = useMediaSelector();

  const getItems = (val: MediaItem | MediaItem[] | string | null | undefined): MediaItem[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      if (!val) return [];
      // Create a mock MediaItem from the string URL
      return [{
        id: 'external',
        filename: 'external-media',
        original_filename: 'External Media',
        file_type: 'image', // Default to image, could try to infer
        mime_type: 'image/jpeg',
        file_size: 0,
        s3_key: 'external',
        s3_url: val,
        cloudfront_url: val,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as MediaItem];
    }
    return [val];
  };

  const selectedItems = getItems(value);

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;

    const typeText = fileType === 'all' ? 'media' : fileType === 'image' ? 'image' : 'video';
    return multiple
      ? `Select ${typeText}${maxSelections ? ` (max ${maxSelections})` : ''}`
      : `Choose ${typeText}`;
  };

  const handleSelect = () => {
    openSelector({
      multiple,
      fileType,
      title: multiple ? 'Select Media Files' : 'Choose Media File',
      maxSelections,
      onSelect: (media) => {
        onChange(media);
      }
    });
  };

  const handleRemove = (itemToRemove?: MediaItem) => {
    if (!allowRemove) return;

    if (multiple && itemToRemove) {
      const currentItems = getItems(value);
      const newItems = currentItems.filter(item => item.id !== itemToRemove.id);
      onChange(newItems.length > 0 ? newItems : null);
    } else {
      onChange(null);
    }
  };

  const handleRemoveAll = () => {
    if (!allowRemove) return;
    onChange(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selection Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSelect}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed transition-all duration-200
            ${isDark
              ? 'border-gray-600 hover:border-blue-500 bg-gray-800 text-gray-300'
              : 'border-gray-300 hover:border-blue-500 bg-white text-gray-700'
            }
          `}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{selectedItems.length > 0 ? 'Change Selection' : getPlaceholderText()}</span>
        </button>

        {/* Remove All Button (for multiple selection) */}
        {multiple && selectedItems.length > 0 && allowRemove && (
          <button
            onClick={handleRemoveAll}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isDark
                ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
              }
            `}
            type="button"
          >
            Remove All
          </button>
        )}
      </div>

      {/* Selected Media Preview */}
      {selectedItems.length > 0 && showPreview && (
        <div className={`
          p-4 rounded-lg border
          ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Selected {fileType === 'all' ? 'Media' : fileType === 'image' ? 'Images' : 'Videos'}
            </h4>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {multiple ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedItems.map((item) => (
                <MediaPreviewCard
                  key={item.id}
                  item={item}
                  onRemove={allowRemove ? () => handleRemove(item) : undefined}
                />
              ))}
            </div>
          ) : (
            <MediaPreviewCard
              item={selectedItems[0]}
              onRemove={allowRemove ? () => handleRemove() : undefined}
              large
            />
          )}
        </div>
      )}

      {/* Selection Count Info */}
      {multiple && maxSelections && (
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {selectedItems.length} of {maxSelections} selected
        </p>
      )}

      {/* Media Selector Modal */}
      {MediaSelectorComponent}
    </div>
  );
}

// Media Preview Card Component
interface MediaPreviewCardProps {
  item: MediaItem;
  onRemove?: () => void;
  large?: boolean;
}

function MediaPreviewCard({ item, onRemove, large = false }: MediaPreviewCardProps) {
  const { isDark } = useTheme();
  const isImage = item.file_type === 'image';
  const displayUrl = item.cloudfront_url || item.s3_url;

  return (
    <div className={`
      relative group rounded-lg overflow-hidden
      ${large ? 'aspect-video' : 'aspect-square'}
    `}>
      {/* Media Content */}
      {isImage ? (
        <Image
          src={displayUrl}
          alt={item.alt_text || item.filename}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className={`
          w-full h-full flex flex-col items-center justify-center
          ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
        `}>
          <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {item.duration && (
            <span className="text-xs text-gray-500">
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      )}

      {/* Overlay with info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate">
            {item.original_filename}
          </p>
          <p className="text-white/80 text-xs">
            {formatFileSize(item.file_size)}
            {item.width && item.height && (
              <span> • {item.width}×{item.height}</span>
            )}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* File Type Badge */}
      <div className={`
        absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium
        ${isImage
          ? 'bg-green-500/80 text-white'
          : 'bg-blue-500/80 text-white'
        }
      `}>
        {item.file_type.toUpperCase()}
      </div>
    </div>
  );
}

// Hook for managing media picker state
export function useMediaPicker(initialValue?: MediaItem | MediaItem[] | null) {
  const [value, setValue] = useState(initialValue || null);

  return {
    value,
    setValue,
    clear: () => setValue(null),
    isEmpty: !value || (Array.isArray(value) && value.length === 0)
  };
}