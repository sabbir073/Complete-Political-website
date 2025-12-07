import { NextRequest, NextResponse } from 'next/server';
import { completeMultipartUpload, abortMultipartUpload, validateAWSConfig } from '@/lib/aws-s3';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

// POST - Complete multipart upload (no auth required for emergencies)
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
    const {
      uploadId,
      s3Key,
      parts,
      filename,
      originalFilename,
      fileType,
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

    return NextResponse.json({
      success: true,
      url: completeResult.cloudFrontUrl || completeResult.s3Url,
      s3Key,
      filename: filename || s3Key.split('/').pop(),
      originalFilename: originalFilename || filename,
      fileType,
      fileSize: fileSize || 0,
    });

  } catch (error) {
    console.error('Complete multipart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }, { status: 500 });
  }
}

// DELETE - Abort multipart upload (no auth required for emergencies)
export async function DELETE(request: NextRequest) {
  try {
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
