'use client';

/**
 * Reusable Chunked Upload Utility
 *
 * This utility provides chunked file uploads for large files to avoid 413 errors.
 * It splits files into smaller chunks and uploads them sequentially.
 */

export interface ChunkedUploadOptions {
  chunkSize?: number;
  threshold?: number;
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

export interface ChunkedUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  data?: any;
}

const DEFAULT_CHUNK_SIZE = 512 * 1024; // 512KB chunks
const DEFAULT_THRESHOLD = 1 * 1024 * 1024; // 1MB threshold for chunked upload

/**
 * Generate a unique upload ID
 */
function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Upload a single chunk to the server
 */
async function uploadChunk(
  chunk: Blob,
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  filename: string,
  fileType: string,
  fileSize: number,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('uploadId', uploadId);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('totalChunks', totalChunks.toString());
  formData.append('filename', filename);
  formData.append('fileType', fileType);
  formData.append('fileSize', fileSize.toString());

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: errorData.error || 'Chunk upload failed' };
  }

  return { success: true };
}

/**
 * Complete a chunked upload
 */
async function completeChunkedUpload(
  uploadId: string,
  filename: string,
  endpoint: string
): Promise<ChunkedUploadResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, filename }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: errorData.error || 'Failed to complete upload' };
  }

  const data = await response.json();
  return { success: true, url: data.url, data };
}

/**
 * Upload a file using chunked upload
 */
export async function uploadFileChunked(
  file: File | Blob,
  filename: string,
  chunkEndpoint: string,
  completeEndpoint: string,
  options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadResult> {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    onProgress,
    onChunkComplete,
  } = options;

  const uploadId = generateUploadId();
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileType = file.type || 'application/octet-stream';

  try {
    // Upload chunks sequentially
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const result = await uploadChunk(
        chunk,
        uploadId,
        chunkIndex,
        totalChunks,
        filename,
        fileType,
        file.size,
        chunkEndpoint
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Update progress
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 90); // 90% for upload
      onProgress?.(progress);
      onChunkComplete?.(chunkIndex, totalChunks);
    }

    // Complete the upload
    onProgress?.(95);
    const completeResult = await completeChunkedUpload(uploadId, filename, completeEndpoint);

    if (completeResult.success) {
      onProgress?.(100);
    }

    return completeResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a file using regular FormData (for small files)
 */
export async function uploadFileRegular(
  file: File | Blob,
  filename: string,
  endpoint: string,
  options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadResult> {
  const { onProgress } = options;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file, filename);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ success: true, url: data.url, data });
        } catch {
          resolve({ success: false, error: 'Invalid response' });
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          resolve({ success: false, error: errorData.error || 'Upload failed' });
        } catch {
          resolve({ success: false, error: `Upload failed with status ${xhr.status}` });
        }
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ success: false, error: 'Network error' });
    });

    xhr.open('POST', endpoint);
    xhr.send(formData);
  });
}

/**
 * Smart upload function that chooses between chunked and regular upload
 * based on file size
 */
export async function uploadFile(
  file: File | Blob,
  filename: string,
  endpoints: {
    regular: string;
    chunk: string;
    complete: string;
  },
  options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadResult> {
  const { threshold = DEFAULT_THRESHOLD } = options;

  if (file.size > threshold) {
    // Use chunked upload for large files
    return uploadFileChunked(file, filename, endpoints.chunk, endpoints.complete, options);
  } else {
    // Use regular upload for small files
    return uploadFileRegular(file, filename, endpoints.regular, options);
  }
}

/**
 * React hook for chunked uploads
 */
export function useChunkedUpload() {
  return {
    uploadFile,
    uploadFileChunked,
    uploadFileRegular,
  };
}
