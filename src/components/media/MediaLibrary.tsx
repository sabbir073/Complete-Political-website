/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MediaItem, MediaLibraryResponse, MediaFilter } from '@/types/media.types';
import { formatFileSize } from '@/lib/media-utils';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import MediaUploader from './MediaUploader';
import MediaEditModal from './MediaEditModal';

interface MediaLibraryProps {
  onSelect?: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
  className?: string;
  showUploader?: boolean;
  selectionMode?: boolean;
}

export default function MediaLibrary({
  onSelect,
  multiple = false,
  fileType = 'all',
  className = '',
  showUploader = true,
  selectionMode = false
}: MediaLibraryProps) {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showError, showSuccess } = useSweetAlert();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<MediaFilter>({
    fileType,
    search: '',
    limit: 20,
    offset: 0
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<Array<{value: string, label: string}>>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch available dates for filtering
  const fetchAvailableDates = useCallback(async () => {
    try {
      const response = await fetch('/api/media/dates');
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.dates || []);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  }, []);

  // Fetch media items
  const fetchMedia = useCallback(async (resetItems = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        fileType: filter.fileType || 'all',
        search: filter.search || '',
        limit: String(filter.limit || 20),
        page: String(Math.floor((filter.offset || 0) / (filter.limit || 20)) + 1)
      });
      
      if (selectedDate) {
        const [year, month] = selectedDate.split('-');
        params.append('year', year);
        params.append('month', month);
      }

      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) throw new Error('Failed to fetch media');

      const data: MediaLibraryResponse = await response.json();
      
      if (resetItems) {
        setMediaItems(data.items);
      } else {
        setMediaItems(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load and when filters change (reset items)
  useEffect(() => {
    fetchMedia(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.fileType, filter.search, selectedDate]);

  // Load more when offset changes (append items)
  useEffect(() => {
    if (filter.offset && filter.offset > 0) {
      fetchMedia(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.offset]);

  // Fetch available dates on component mount
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Load more items
  const loadMore = () => {
    if (!hasMore || loading) return;

    setFilter(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20)
    }));
    // fetchMedia is triggered by the useEffect watching filter.offset
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilter(prev => ({ ...prev, search: searchTerm, offset: 0 }));
    setSelectedItems(new Set());
  };

  // Handle file type filter
  const handleFileTypeFilter = (type: 'all' | 'image' | 'video') => {
    setFilter(prev => ({ ...prev, fileType: type, offset: 0 }));
    setSelectedItems(new Set());
  };

  // Handle item selection
  const handleItemSelect = (item: MediaItem) => {
    if (!selectionMode) {
      onSelect?.(item);
      return;
    }

    const newSelected = new Set(selectedItems);
    
    if (multiple) {
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
    } else {
      newSelected.clear();
      newSelected.add(item.id);
    }
    
    setSelectedItems(newSelected);
    
    // Call onSelect with selected items
    const selectedMediaItems = mediaItems.filter(media => newSelected.has(media.id));
    if (multiple) {
      onSelect?.(selectedMediaItems);
    } else if (selectedMediaItems.length > 0) {
      onSelect?.(selectedMediaItems[0]);
    }
  };

  // Handle upload complete
  const handleUploadComplete = (newItems: MediaItem[]) => {
    setMediaItems(prev => [...newItems, ...prev]);
    setTotal(prev => prev + newItems.length);
    setShowUploadArea(false);
    // Refresh available dates since new files were uploaded
    fetchAvailableDates();
  };

  // Delete media item
  const handleDelete = async (mediaId: string) => {
    const mediaItem = mediaItems.find(item => item.id === mediaId);
    const result = await showDeleteConfirm(mediaItem?.original_filename);
    
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete media');

      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(mediaId);
        return newSelected;
      });
      setTotal(prev => prev - 1);
      // Refresh available dates since a file was deleted
      fetchAvailableDates();
      
      showSuccess('Deleted!', `"${mediaItem?.original_filename}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting media:', error);
      showError('Delete Failed', 'Failed to delete media item. Please try again.');
    }
  };

  // Handle edit media
  const handleEditMedia = (mediaItem: MediaItem) => {
    setEditingMedia(mediaItem);
    setShowEditModal(true);
  };

  // Handle save edited media
  const handleSaveEditedMedia = (updatedItem: MediaItem) => {
    setMediaItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    setShowEditModal(false);
    setEditingMedia(null);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMedia(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Media Library
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {total} items total
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {showUploader && (
            <button
              type="button"
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {showUploadArea ? 'Hide Upload' : 'Upload Files'}
            </button>
          )}
          
          {/* View Toggle */}
          <div className={`flex rounded-lg p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-blue-500 text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-blue-500 text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {showUploadArea && showUploader && (
        <MediaUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => showError('Upload Failed', error)}
          className="border-2 border-dashed border-blue-300 rounded-lg p-6"
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search media..."
            value={filter.search}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        {/* File Type Filter */}
        <select
          value={filter.fileType}
          onChange={(e) => handleFileTypeFilter(e.target.value as 'all' | 'image' | 'video')}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Files</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>

        {/* Date Filter (WordPress Style) */}
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All dates</option>
          {availableDates.map((date) => (
            <option key={date.value} value={date.value}>
              {date.label}
            </option>
          ))}
        </select>
      </div>

      {/* Selection Info */}
      {selectionMode && selectedItems.size > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200'} border`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            {multiple && (
              <button
                type="button"
                onClick={() => setSelectedItems(new Set())}
                className="ml-2 text-blue-500 hover:text-blue-600 underline"
              >
                Clear selection
              </button>
            )}
          </p>
        </div>
      )}

      {/* Media Grid/List */}
      {loading && mediaItems.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No media found</p>
          <p className="text-sm">Upload some files to get started</p>
        </div>
      ) : (
        <div className={
          view === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' 
            : 'space-y-2'
        }>
          {mediaItems.map((item) => (
            <MediaItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              view={view}
              onSelect={() => handleItemSelect(item)}
              onDelete={() => handleDelete(item.id)}
              onEdit={() => handleEditMedia(item)}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <MediaEditModal
        mediaItem={editingMedia}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedMedia}
      />
    </div>
  );
}

// Media Item Card Component
interface MediaItemCardProps {
  item: MediaItem;
  isSelected: boolean;
  view: 'grid' | 'list';
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  selectionMode: boolean;
}

function MediaItemCard({ item, isSelected, view, onSelect, onDelete, onEdit, selectionMode }: MediaItemCardProps) {
  const { isDark } = useTheme();
  const isImage = item.file_type === 'image';
  const displayUrl = item.cloudfront_url || item.s3_url;

  if (view === 'list') {
    return (
      <div className={`
        flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-500/10' : isDark ? 'border-gray-700 hover:border-gray-600 bg-gray-800' : 'border-gray-200 hover:border-gray-300 bg-white'}
      `} onClick={onSelect}>
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
          {isImage ? (
            <Image 
              src={displayUrl} 
              alt={item.alt_text || item.filename} 
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 ml-3 min-w-0">
          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {item.original_filename}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatFileSize(item.file_size)} • {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectionMode && isSelected && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-blue-500 hover:bg-blue-500/10 rounded cursor-pointer"
            title="Edit media"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
            title="Delete media"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105
      ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `} onClick={onSelect}>
      <div className="aspect-square relative">
        {isImage ? (
          <Image 
            src={displayUrl} 
            alt={item.alt_text || item.filename} 
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 cursor-pointer"
            title="Edit media"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
            title="Delete media"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {selectionMode && isSelected && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Title */}
      <div className={`p-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {item.original_filename}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {formatFileSize(item.file_size)}
        </p>
      </div>
    </div>
  );
}