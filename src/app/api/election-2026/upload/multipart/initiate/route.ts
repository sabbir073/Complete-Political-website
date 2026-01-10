import { NextRequest, NextResponse } from 'next/server';
import { initMultipartUpload, validateAWSConfig, getPresignedPartUrls } from '@/lib/aws-s3';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Minimum part size for S3 multipart (5MB, except last part)
const MIN_PART_SIZE = 5 * 1024 * 1024;

// Supported image types for supporter photos - only PNG and JPG
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max for photos

// Generate S3 key for election supporter photos
function generateElectionS3Key(filename: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);

  return `election2026/${year}/${month}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

// POST - Initiate multipart upload and return presigned URLs for all parts
// No auth required for supporter photo upload
export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      return NextResponse.json({
        success: false,
        error: configError instanceof Error ? configError.message : 'AWS configuration error'
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

    // Validate file type - only PNG and JPG
    if (!SUPPORTED_TYPES.includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: `Only PNG and JPG files are accepted. Your file type: ${fileType}`
      }, { status: 400 });
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Generate unique S3 key
    const s3Key = generateElectionS3Key(filename);

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
      filename,
      originalFilename: filename,
      fileType,
      type: 'image',
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
