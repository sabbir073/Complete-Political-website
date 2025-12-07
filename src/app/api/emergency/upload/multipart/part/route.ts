import { NextRequest, NextResponse } from 'next/server';
import { listUploadedParts, validateAWSConfig } from '@/lib/aws-s3';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// POST - Verify a part was uploaded to S3 and return its ETag
// Browser uploads directly to S3 using presigned URL, then calls this to get the ETag
// This bypasses Vercel's 4.5MB body size limit for serverless functions
// No auth required for emergencies
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

    // Get JSON body (small payload - just the part info)
    const body = await request.json();
    const { uploadId, s3Key, partNumber } = body;

    if (!uploadId || !s3Key || !partNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: uploadId, s3Key, partNumber'
      }, { status: 400 });
    }

    // List parts from S3 to get the ETag
    const result = await listUploadedParts(s3Key, uploadId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to verify part'
      }, { status: 500 });
    }

    // Find the specific part
    const part = result.parts.find(p => p.PartNumber === parseInt(partNumber));

    if (!part) {
      return NextResponse.json({
        success: false,
        error: `Part ${partNumber} not found. It may not have been uploaded yet.`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      etag: part.ETag,
      partNumber: part.PartNumber,
      size: part.Size
    });

  } catch (error) {
    console.error('Emergency verify part error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify part'
    }, { status: 500 });
  }
}
