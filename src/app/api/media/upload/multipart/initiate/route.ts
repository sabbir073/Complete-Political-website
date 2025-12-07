import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initMultipartUpload, validateAWSConfig, getPresignedPartUrls } from '@/lib/aws-s3';
import { generateFileName, generateS3Key } from '@/lib/media-utils';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Minimum part size for S3 multipart (5MB, except last part)
const MIN_PART_SIZE = 5 * 1024 * 1024;

// POST - Initiate multipart upload and return presigned URLs for all parts
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

    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { filename, fileType, fileSize, partSize = MIN_PART_SIZE } = body;

    if (!filename || !fileType || !fileSize) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: filename, fileType, fileSize'
      }, { status: 400 });
    }

    // Determine file type category
    const type = fileType.startsWith('image/') ? 'image' : 'video';

    // Generate unique filename and S3 key
    const uniqueFilename = generateFileName(filename);
    const s3Key = generateS3Key(uniqueFilename, type as 'image' | 'video');

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
      type,
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
