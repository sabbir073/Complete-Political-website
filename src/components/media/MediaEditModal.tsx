'use client';

import { useState, useEffect } from 'react';
import { MediaItem } from '@/types/media.types';
import { useTheme } from '@/providers/ThemeProvider';
import { formatFileSize } from '@/lib/media-utils';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface MediaEditModalProps {
  mediaItem: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: MediaItem) => void;
}

export default function MediaEditModal({ mediaItem, isOpen, onClose, onSave }: MediaEditModalProps) {
  const { isDark } = useTheme();
  const { showError, showSuccess } = useSweetAlert();
  const [formData, setFormData] = useState({
    alt_text: '',
    caption: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Update form data when mediaItem changes
  useEffect(() => {
    if (mediaItem) {
      setFormData({
        alt_text: mediaItem.alt_text || '',
        caption: mediaItem.caption || '',
        description: mediaItem.description || ''
      });
    }
  }, [mediaItem]);

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!mediaItem) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/media/${mediaItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update media item');
      }

      const data = await response.json();
      onSave(data.mediaItem);
      showSuccess('Updated!', 'Media item has been updated successfully.');
      onClose();
    } catch (error) {
      console.error('Error updating media:', error);
      showError('Update Failed', 'Failed to update media item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !mediaItem) return null;

  const isImage = mediaItem.file_type === 'image';
  const displayUrl = mediaItem.cloudfront_url || mediaItem.s3_url;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold">Edit Media</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Media Preview */}
              <div className="space-y-4">
                <div className={`relative rounded-lg overflow-hidden border ${
                  isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  {isImage ? (
                    <img
                      src={displayUrl}
                      alt={mediaItem.original_filename}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        controls
                        className="w-full h-auto max-h-96 object-contain bg-black"
                        preload="metadata"
                        controlsList="nodownload"
                        disablePictureInPicture={false}
                        playsInline
                      >
                        <source src={displayUrl} type={mediaItem.mime_type} />
                        <p className="text-sm text-gray-500 p-4">
                          Your browser does not support the video tag.
                        </p>
                      </video>
                      {/* Video info overlay */}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {mediaItem.duration && `${Math.floor(mediaItem.duration / 60)}:${(mediaItem.duration % 60).toString().padStart(2, '0')}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className="font-medium mb-3">File Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Filename:</span>
                      <span className="ml-2">{mediaItem.original_filename}</span>
                    </div>
                    <div>
                      <span className="font-medium">File type:</span>
                      <span className="ml-2">{mediaItem.mime_type}</span>
                    </div>
                    <div>
                      <span className="font-medium">File size:</span>
                      <span className="ml-2">{formatFileSize(mediaItem.file_size)}</span>
                    </div>
                    {mediaItem.width && mediaItem.height && (
                      <div>
                        <span className="font-medium">Dimensions:</span>
                        <span className="ml-2">{mediaItem.width} × {mediaItem.height}</span>
                      </div>
                    )}
                    {mediaItem.duration && (
                      <div>
                        <span className="font-medium">Duration:</span>
                        <span className="ml-2">{Math.round(mediaItem.duration)}s</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <span className="ml-2">{new Date(mediaItem.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* URL Section */}
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className="font-medium mb-3">File URL</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={displayUrl}
                      readOnly
                      className={`flex-1 px-3 py-2 text-sm rounded border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-gray-300' 
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    />
                    <button
                      onClick={() => copyToClipboard(displayUrl)}
                      className={`px-4 py-2 text-sm rounded transition-colors cursor-pointer ${
                        copySuccess
                          ? 'bg-green-500 text-white'
                          : isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {mediaItem.cloudfront_url ? 'CloudFront CDN URL' : 'Direct S3 URL'}
                  </p>
                </div>
              </div>

              {/* Right: Edit Form */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Edit Details</h3>
                
                {/* Alt Text */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Describe the image for accessibility"
                    className={`w-full px-3 py-2 rounded border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alternative text for screen readers and SEO
                  </p>
                </div>

                {/* Caption */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Caption
                  </label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Short caption for this media"
                    className={`w-full px-3 py-2 rounded border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Caption text displayed with the media
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of this media item"
                    rows={4}
                    className={`w-full px-3 py-2 rounded border transition-colors resize-vertical ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Detailed description for internal reference
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end space-x-3 p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}