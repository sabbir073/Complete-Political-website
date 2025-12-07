import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { completeMultipartUpload, abortMultipartUpload, validateAWSConfig } from '@/lib/aws-s3';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

// POST - Complete multipart upload
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
    const {
      uploadId,
      s3Key,
      parts,
      filename,
      originalFilename,
      fileType,
      type,
      fileSize
    } = body;

    if (!uploadId || !s3Key || !parts || !Array.isArray(parts)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: uploadId, s3Key, parts'
      }, { status: 400 });
    }

    // Sort parts by part number (S3 requires this)
    const sortedParts: CompletedPart[] = parts
      .sort((a: CompletedPart, b: CompletedPart) => a.PartNumber - b.PartNumber);

    // Complete multipart upload with S3
    const completeResult = await completeMultipartUpload(s3Key, uploadId, sortedParts);

    if (!completeResult.success) {
      return NextResponse.json({
        success: false,
        error: completeResult.error || 'Failed to complete multipart upload'
      }, { status: 500 });
    }

    // Save to database
    const serviceClient = createServiceClient();
    const { data: mediaItem, error: dbError } = await serviceClient
      .from('media_library')
      .insert({
        filename: filename || s3Key.split('/').pop(),
        original_filename: originalFilename || filename,
        file_type: type || (fileType?.startsWith('image/') ? 'image' : 'video'),
        mime_type: fileType,
        file_size: fileSize || 0,
        s3_key: s3Key,
        s3_url: completeResult.s3Url!,
        cloudfront_url: completeResult.cloudFrontUrl,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // File is already in S3, so we don't delete it - just log the error
      return NextResponse.json({
        success: false,
        error: 'File uploaded but failed to save to database',
        s3Url: completeResult.s3Url,
        cloudFrontUrl: completeResult.cloudFrontUrl,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: [{
        filename: originalFilename || filename,
        success: true,
        mediaItem
      }],
      message: 'Upload completed successfully'
    });

  } catch (error) {
    console.error('Complete multipart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }, { status: 500 });
  }
}

// DELETE - Abort multipart upload
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { uploadId, s3Key } = body;

    if (!uploadId || !s3Key) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: uploadId, s3Key'
      }, { status: 400 });
    }

    const abortResult = await abortMultipartUpload(s3Key, uploadId);

    return NextResponse.json({
      success: abortResult.success,
      error: abortResult.error
    });

  } catch (error) {
    console.error('Abort multipart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to abort upload'
    }, { status: 500 });
  }
}
