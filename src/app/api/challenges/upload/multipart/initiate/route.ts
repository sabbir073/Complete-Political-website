import { NextRequest, NextResponse } from 'next/server';
import { initMultipartUpload, validateAWSConfig, getPresignedPartUrls } from '@/lib/aws-s3';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const MIN_PART_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 200 * 1024 * 1024;
const SUPPORTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm',
];

function generateS3Key(filename: string, fileType: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const safeName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
  const type = fileType.startsWith('video/') ? 'videos' : 'images';
  return `challenges/${type}/${year}/${month}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    try { validateAWSConfig(); } catch (e) {
      return NextResponse.json({ success: false, error: 'AWS configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { filename, fileType, fileSize, partSize = MIN_PART_SIZE } = body;

    if (!filename || !fileType || !fileSize) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (!SUPPORTED_TYPES.includes(fileType)) {
      return NextResponse.json({ success: false, error: `Unsupported file type: ${fileType}` }, { status: 400 });
    }
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 200MB' }, { status: 400 });
    }

    const s3Key = generateS3Key(filename, fileType);
    const effectivePartSize = Math.max(partSize, MIN_PART_SIZE);
    const totalParts = Math.ceil(fileSize / effectivePartSize);
    const type = fileType.startsWith('video/') ? 'video' : 'image';

    const initResult = await initMultipartUpload(s3Key, fileType);
    if (!initResult.success || !initResult.uploadId) {
      return NextResponse.json({ success: false, error: initResult.error || 'Failed to initiate upload' }, { status: 500 });
    }

    const urlsResult = await getPresignedPartUrls(s3Key, initResult.uploadId, totalParts);
    if (!urlsResult.success) {
      return NextResponse.json({ success: false, error: urlsResult.error || 'Failed to generate upload URLs' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      uploadId: initResult.uploadId,
      s3Key,
      filename,
      originalFilename: filename,
      fileType,
      type,
      totalParts,
      partSize: effectivePartSize,
      urls: urlsResult.urls,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to initiate upload' }, { status: 500 });
  }
}
