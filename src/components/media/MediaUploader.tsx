/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MediaItem, UploadProgress } from '@/types/media.types';
import { validateFile, formatFileSize, getImageDimensions, getVideoDuration } from '@/lib/media-utils';
import { useTheme } from '@/providers/ThemeProvider';

// Chunk size: 512KB (safe for most servers)
const CHUNK_SIZE = 512 * 1024;
// Threshold for chunked upload: 1MB
const CHUNKED_UPLOAD_THRESHOLD = 1 * 1024 * 1024;

interface MediaUploaderProps {
  onUploadComplete?: (mediaItems: MediaItem[]) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
  showPreview?: boolean;
}

export default function MediaUploader({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  maxFiles = 10,
  className = '',
  showPreview = true
}: MediaUploaderProps) {
  const { isDark } = useTheme();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Generate unique upload ID
  const generateUploadId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Chunked upload for large files
  const uploadFileChunked = async (
    file: File,
    uploadId: string,
    onProgress: (progress: number) => void
  ): Promise<MediaItem> => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunkUploadId = generateUploadId();

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('uploadId', chunkUploadId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('filename', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());

      const response = await fetch('/api/media/upload/chunk', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Chunk ${chunkIndex} upload failed`);
      }

      // Update progress
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 90); // 90% for chunks
      onProgress(progress);
    }

    // Complete the upload
    const completeResponse = await fetch('/api/media/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId: chunkUploadId })
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.error || 'Failed to complete upload');
    }

    const result = await completeResponse.json();

    if (!result.success || !result.results[0]?.success) {
      throw new Error(result.results[0]?.error || result.message || 'Upload failed');
    }

    onProgress(100);
    return result.results[0].mediaItem;
  };

  // Regular upload for small files (using XHR for progress)
  const uploadFileRegular = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('files', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.results[0]?.success) {
            resolve(response.results[0].mediaItem);
          } else {
            reject(new Error(response.results[0]?.error || 'Upload failed'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  };

  const uploadFiles = useCallback(async (uploadItems: UploadProgress[]) => {
    const completedUploads: MediaItem[] = [];

    for (let i = 0; i < uploadItems.length; i++) {
      const upload = uploadItems[i];

      try {
        // Update status to uploading
        const startingUploads = uploadItems.map(u =>
          u.id === upload.id ? { ...u, status: 'uploading' as const, progress: 0 } : u
        );
        setUploads(startingUploads);
        onUploadProgress?.(startingUploads);

        // Get file dimensions/duration for metadata
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        if (upload.file.type.startsWith('image/')) {
          try {
            const dimensions = await getImageDimensions(upload.file);
            width = dimensions.width;
            height = dimensions.height;
          } catch (error) {
            console.warn('Failed to get image dimensions:', error);
          }
        } else if (upload.file.type.startsWith('video/')) {
          try {
            duration = await getVideoDuration(upload.file);
          } catch (error) {
            console.warn('Failed to get video duration:', error);
          }
        }

        // Progress callback
        const updateProgress = (progress: number) => {
          const progressUploads = uploadItems.map(u =>
            u.id === upload.id ? { ...u, progress, status: 'uploading' as const } : u
          );
          setUploads(progressUploads);
          onUploadProgress?.(progressUploads);
        };

        // Choose upload method based on file size
        let mediaItem: MediaItem;
        if (upload.file.size > CHUNKED_UPLOAD_THRESHOLD) {
          // Use chunked upload for large files
          mediaItem = await uploadFileChunked(upload.file, upload.id, updateProgress);
        } else {
          // Use regular upload for small files
          mediaItem = await uploadFileRegular(upload.file, updateProgress);
        }

        // Update metadata if we got dimensions/duration
        if ((width && height) || duration) {
          try {
            await fetch(`/api/media/${mediaItem.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...(width && height && { width, height }),
                ...(duration && { duration })
              })
            });
          } catch (metadataError) {
            console.warn('Failed to update metadata:', metadataError);
          }
        }

        // Update status to completed
        const finishedUploads = uploadItems.map(u =>
          u.id === upload.id ? {
            ...u,
            status: 'completed' as const,
            progress: 100,
            mediaItem
          } : u
        );
        setUploads(finishedUploads);
        onUploadProgress?.(finishedUploads);

        completedUploads.push(mediaItem);

      } catch (error) {
        console.error(`Upload failed for ${upload.file.name}:`, error);

        // Update status to error
        const errorUploads = uploadItems.map(u =>
          u.id === upload.id ? {
            ...u,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : u
        );
        setUploads(errorUploads);
        onUploadProgress?.(errorUploads);

        onUploadError?.(`Failed to upload ${upload.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsUploading(false);

    if (completedUploads.length > 0) {
      onUploadComplete?.(completedUploads);
    }
  }, [onUploadComplete, onUploadError, onUploadProgress]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Validate files and create upload progress items
    const validFiles: UploadProgress[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push({
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'pending'
        });
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setUploads(validFiles);
    setIsUploading(true);
    onUploadProgress?.(validFiles);

    // Upload files one by one
    await uploadFiles(validFiles);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles,
    disabled: isUploading
  });

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const retryUpload = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (!upload) return;

    await uploadFiles([{ ...upload, status: 'pending', progress: 0, error: undefined }]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : isDark
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isDragActive ? 'Drop files here' : isUploading ? 'Uploading...' : 'Drop files or click to browse'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Images up to 20MB, Videos up to 100MB
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Supports: JPG, PNG, WebP, GIF, MP4, MOV, AVI
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && showPreview && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upload Progress ({uploads.filter(u => u.status === 'completed').length}/{uploads.length})
          </h4>

          <div className="space-y-3">
            {uploads.map((upload) => (
              <div key={upload.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      upload.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      upload.status === 'error' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {upload.status === 'completed' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {upload.status === 'error' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {(upload.status === 'pending' || upload.status === 'uploading') && (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {upload.file.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatFileSize(upload.file.size)}
                        {upload.file.size > CHUNKED_UPLOAD_THRESHOLD && ' (chunked)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.status === 'error' && (
                      <button
                        onClick={() => retryUpload(upload.id)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className={`text-xs px-2 py-1 rounded hover:bg-opacity-80 ${
                        isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                )}

                {/* Success Message */}
                {upload.status === 'completed' && (
                  <p className="text-xs text-green-500 mt-1">Upload completed successfully</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
