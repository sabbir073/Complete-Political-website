import { NextRequest, NextResponse } from 'next/server';
import { uploadPart, validateAWSConfig } from '@/lib/aws-s3';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// POST - Upload a single part (server-proxied to avoid CORS issues with ETag)
// No auth required for complaints
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadId = formData.get('uploadId') as string | null;
    const s3Key = formData.get('s3Key') as string | null;
    const partNumber = formData.get('partNumber') as string | null;

    if (!file || !uploadId || !s3Key || !partNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: file, uploadId, s3Key, partNumber'
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload part to S3
    const result = await uploadPart(s3Key, uploadId, parseInt(partNumber), buffer);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to upload part'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      etag: result.etag,
      partNumber: result.partNumber
    });

  } catch (error) {
    console.error('Complaints upload part error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload part'
    }, { status: 500 });
  }
}
