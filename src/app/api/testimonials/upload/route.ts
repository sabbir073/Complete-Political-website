import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB for videos

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  return `${timestamp}-${uuid}.${ext}`;
}

function generateS3Key(filename: string, type: 'image' | 'video'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `testimonials/${type}s/${year}/${month}/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string; // 'photo' or 'video'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Determine file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json({
        success: false,
        error: `Invalid file type: ${file.type}. Allowed: images (JPEG, PNG, WebP, GIF) or videos (MP4, WebM, MOV, AVI)`
      }, { status: 400 });
    }

    // Check file type matches upload type
    if (uploadType === 'photo' && !isImage) {
      return NextResponse.json({
        success: false,
        error: 'Please upload an image file for your photo'
      }, { status: 400 });
    }

    if (uploadType === 'video' && !isVideo) {
      return NextResponse.json({
        success: false,
        error: 'Please upload a video file'
      }, { status: 400 });
    }

    // Check file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'videos'}`
      }, { status: 400 });
    }

    // Generate unique filename and S3 key
    const filename = generateFileName(file.name);
    const fileType = isImage ? 'image' : 'video';
    const s3Key = generateS3Key(filename, fileType);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const uploadResult = await uploadToS3(buffer, s3Key, file.type);

    if (!uploadResult.success) {
      return NextResponse.json({
        success: false,
        error: uploadResult.error || 'Upload failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.cloudFrontUrl || uploadResult.s3Url,
      filename,
      fileType,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Testimonial upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}
