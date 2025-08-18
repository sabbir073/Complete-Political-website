// Media Library Types
export interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: 'image' | 'video';
  mime_type: string;
  file_size: number;
  s3_key: string;
  s3_url: string;
  cloudfront_url?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  duration?: number; // for videos in seconds
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// Upload Progress Types
export interface UploadProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  mediaItem?: MediaItem;
}

// Batch Upload Response
export interface BatchUploadResponse {
  success: boolean;
  results: Array<{
    filename: string;
    success: boolean;
    mediaItem?: MediaItem;
    error?: string;
  }>;
  message: string;
}

// Media Library Filter Options
export interface MediaFilter {
  fileType?: 'image' | 'video' | 'all';
  search?: string;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Media Library Response
export interface MediaLibraryResponse {
  items: MediaItem[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// Media Selection Props (for WordPress-style picker)
export interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
  title?: string;
}

// Media Upload Props
export interface MediaUploaderProps {
  onUploadComplete?: (mediaItems: MediaItem[]) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
}

// Media Item Update Data
export interface MediaUpdateData {
  alt_text?: string;
  caption?: string;
  description?: string;
}

// S3 Upload Result
export interface S3UploadResult {
  s3Url: string | null;
  cloudFrontUrl: string | null;
  success: boolean;
  error?: string;
}

// File Validation Result
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileType: 'image' | 'video' | 'unknown';
}

// Media Stats (for dashboard)
export interface MediaStats {
  totalItems: number;
  totalImages: number;
  totalVideos: number;
  totalSize: number;
  recentUploads: number;
}