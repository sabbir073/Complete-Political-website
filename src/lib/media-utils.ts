import { v4 as uuidv4 } from 'uuid';

// Supported file types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/quicktime'
];

export const ALL_SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB (increased from 10MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// File validation
export function validateFile(file: File) {
  const errors: string[] = [];

  // Check file type
  if (!ALL_SUPPORTED_TYPES.includes(file.type)) {
    errors.push(`Unsupported file type: ${file.type}`);
  }

  // Check file size
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    errors.push(`Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    errors.push(`Video size must be less than ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileType: isImage ? 'image' : isVideo ? 'video' : 'unknown'
  };
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const name = originalName.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '-');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  
  return `${timestamp}-${uuid}-${name}.${ext}`;
}

// Generate S3 key path
export function generateS3Key(filename: string, fileType: 'image' | 'video'): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return `media/${fileType}s/${year}/${month}/${filename}`;
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file type from mime type
export function getFileTypeFromMime(mimeType: string): 'image' | 'video' | 'unknown' {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return 'video';
  return 'unknown';
}

// Get image dimensions from file (client-side)
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Get video duration from file (client-side)
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration));
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

// Convert file to buffer (Node.js server-side)
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}