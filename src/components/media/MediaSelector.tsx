"use client";

import { useState } from 'react';
import { MediaItem } from '@/types/media.types';
import { useTheme } from '@/providers/ThemeProvider';
import MediaLibrary from './MediaLibrary';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
  title?: string;
  maxSelections?: number;
}

export default function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  fileType = 'all',
  title = 'Select Media',
  maxSelections
}: MediaSelectorProps) {
  const { isDark } = useTheme();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  if (!isOpen) return null;

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    const mediaArray = Array.isArray(media) ? media : [media];
    
    if (multiple) {
      setSelectedMedia(mediaArray);
    } else {
      // For single selection, immediately call onSelect and close
      onSelect(media);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMedia.length > 0) {
      onSelect(multiple ? selectedMedia : selectedMedia[0]);
      onClose();
    }
  };

  const getFileTypeText = () => {
    switch (fileType) {
      case 'image': return 'images';
      case 'video': return 'videos';
      default: return 'files';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-6xl max-h-[90vh] mx-4 rounded-xl shadow-2xl overflow-hidden
        ${isDark ? 'bg-gray-900' : 'bg-white'}
      `}>
        {/* Header */}
        <div className={`
          flex items-center justify-between p-6 border-b
          ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
        `}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {multiple 
                ? `Select ${getFileTypeText()}${maxSelections ? ` (max ${maxSelections})` : ''}`
                : `Choose a ${fileType === 'all' ? 'file' : fileType} from your library`
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Selection count for multiple selection */}
            {multiple && selectedMedia.length > 0 && (
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}
              `}>
                {selectedMedia.length} selected
                {maxSelections && ` of ${maxSelections}`}
              </span>
            )}
            
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <MediaLibrary
            onSelect={handleMediaSelect}
            multiple={multiple}
            fileType={fileType}
            selectionMode={multiple}
            showUploader={true}
          />
        </div>
        
        {/* Footer - Only show for multiple selection */}
        {multiple && (
          <div className={`
            flex items-center justify-between p-6 border-t
            ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
          `}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedMedia.length === 0 
                ? `No ${getFileTypeText()} selected`
                : `${selectedMedia.length} ${getFileTypeText()} selected`
              }
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmSelection}
                disabled={selectedMedia.length === 0 || (!!maxSelections && selectedMedia.length > maxSelections)}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors
                  ${selectedMedia.length === 0 || (!!maxSelections && selectedMedia.length > maxSelections)
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
              >
                Select {selectedMedia.length > 0 ? `(${selectedMedia.length})` : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for using media selector
export function useMediaSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<MediaSelectorProps>>({});

  const openSelector = (options: Partial<MediaSelectorProps> = {}) => {
    setConfig(options);
    setIsOpen(true);
  };

  const closeSelector = () => {
    setIsOpen(false);
    setConfig({});
  };

  const MediaSelectorComponent = config.onSelect ? (
    <MediaSelector
      isOpen={isOpen}
      onClose={closeSelector}
      {...config}
      onSelect={(media) => {
        config.onSelect?.(media);
        closeSelector();
      }}
    />
  ) : null;

  return {
    openSelector,
    closeSelector,
    MediaSelectorComponent
  };
}