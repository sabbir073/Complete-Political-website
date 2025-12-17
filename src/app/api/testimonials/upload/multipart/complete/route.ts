import { NextRequest, NextResponse } from 'next/server';
import { completeMultipartUpload, validateAWSConfig, getCloudFrontUrl } from '@/lib/aws-s3';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

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
    const { uploadId, s3Key, parts } = body;

    if (!uploadId || !s3Key || !parts || !Array.isArray(parts)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: uploadId, s3Key, parts'
      }, { status: 400 });
    }

    // Complete the multipart upload
    const result = await completeMultipartUpload(s3Key, uploadId, parts);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to complete multipart upload'
      }, { status: 500 });
    }

    // Get CloudFront URL
    const cloudFrontUrl = getCloudFrontUrl(s3Key);

    return NextResponse.json({
      success: true,
      url: cloudFrontUrl || result.location,
      s3Key,
      location: result.location
    });

  } catch (error) {
    console.error('Complete multipart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload'
    }, { status: 500 });
  }
}
