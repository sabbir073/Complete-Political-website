import { NextRequest, NextResponse } from 'next/server';
import { initMultipartUpload, validateAWSConfig, getPresignedPartUrls } from '@/lib/aws-s3';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Minimum part size for S3 multipart (5MB, except last part)
const MIN_PART_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

// Allowed video types
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  return `${timestamp}-${uuid}.${ext}`;
}

function generateS3Key(filename: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `testimonials/videos/${year}/${month}/${filename}`;
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

    const body = await request.json();
    const { filename, fileType, fileSize, partSize = MIN_PART_SIZE } = body;

    if (!filename || !fileType || !fileSize) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: filename, fileType, fileSize'
      }, { status: 400 });
    }

    // Validate video type
    if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid video type. Allowed: MP4, WebM, MOV, AVI`
      }, { status: 400 });
    }

    // Validate file size
    if (fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json({
        success: false,
        error: 'Video file too large. Maximum size is 200MB'
      }, { status: 400 });
    }

    // Generate unique filename and S3 key
    const uniqueFilename = generateFileName(filename);
    const s3Key = generateS3Key(uniqueFilename);

    // Calculate number of parts
    const effectivePartSize = Math.max(partSize, MIN_PART_SIZE);
    const totalParts = Math.ceil(fileSize / effectivePartSize);

    // Initiate multipart upload with S3
    const initResult = await initMultipartUpload(s3Key, fileType);

    if (!initResult.success || !initResult.uploadId) {
      return NextResponse.json({
        success: false,
        error: initResult.error || 'Failed to initiate multipart upload'
      }, { status: 500 });
    }

    // Generate presigned URLs for all parts
    const urlsResult = await getPresignedPartUrls(s3Key, initResult.uploadId, totalParts);

    if (!urlsResult.success) {
      return NextResponse.json({
        success: false,
        error: urlsResult.error || 'Failed to generate upload URLs'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      uploadId: initResult.uploadId,
      s3Key,
      filename: uniqueFilename,
      originalFilename: filename,
      fileType,
      totalParts,
      partSize: effectivePartSize,
      urls: urlsResult.urls,
    });

  } catch (error) {
    console.error('Initiate multipart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate upload'
    }, { status: 500 });
  }
}
