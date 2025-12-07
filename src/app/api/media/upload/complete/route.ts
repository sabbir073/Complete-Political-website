import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';
import { generateFileName, generateS3Key } from '@/lib/media-utils';
import { getChunkData, deleteChunkData } from '@/lib/chunk-store';

export const maxDuration = 120; // 2 minutes for large file assembly
export const dynamic = 'force-dynamic';

// POST - Complete chunked upload
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
    const { uploadId } = body;

    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    // Get chunks from shared store
    const uploadData = getChunkData(uploadId);

    if (!uploadData) {
      return NextResponse.json({ error: 'Upload not found or expired' }, { status: 404 });
    }

    // Check all chunks received
    const missingChunks = uploadData.chunks
      .map((c, i) => c === null ? i : -1)
      .filter(i => i !== -1);

    if (missingChunks.length > 0) {
      return NextResponse.json({
        error: `Missing chunks: ${missingChunks.join(', ')}`,
        missingChunks
      }, { status: 400 });
    }

    // Combine chunks (filter out nulls for TypeScript)
    const validChunks = uploadData.chunks.filter((c): c is Buffer => c !== null);
    const completeFile = Buffer.concat(validChunks);
    const { filename: originalFilename } = uploadData.metadata;

    // Determine MIME type
    const ext = originalFilename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/avi'
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const type = mimeType.startsWith('image/') ? 'image' : 'video';

    // Generate unique filename and S3 key
    const filename = generateFileName(originalFilename);
    const s3Key = generateS3Key(filename, type as 'image' | 'video');

    // Upload to S3
    const uploadResult = await uploadToS3(completeFile, s3Key, mimeType);

    if (!uploadResult.success) {
      return NextResponse.json({
        success: false,
        error: uploadResult.error || 'S3 upload failed'
      }, { status: 500 });
    }

    // Save to database
    const serviceClient = createServiceClient();
    const { data: mediaItem, error: dbError } = await serviceClient
      .from('media_library')
      .insert({
        filename,
        original_filename: originalFilename,
        file_type: type,
        mime_type: mimeType,
        file_size: completeFile.length,
        s3_key: s3Key,
        s3_url: uploadResult.s3Url!,
        cloudfront_url: uploadResult.cloudFrontUrl,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Try to clean up S3 file
      try {
        const { deleteFromS3 } = await import('@/lib/aws-s3');
        await deleteFromS3(s3Key);
      } catch (cleanupError) {
        console.error('S3 cleanup error:', cleanupError);
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to save to database'
      }, { status: 500 });
    }

    // Clean up chunks from memory
    deleteChunkData(uploadId);

    return NextResponse.json({
      success: true,
      results: [{
        filename: originalFilename,
        success: true,
        mediaItem
      }],
      message: 'Upload completed successfully'
    });

  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }, { status: 500 });
  }
}
