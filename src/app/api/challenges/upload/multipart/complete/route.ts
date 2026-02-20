import { NextRequest, NextResponse } from 'next/server';
import { completeMultipartUpload, abortMultipartUpload, validateAWSConfig } from '@/lib/aws-s3';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

export async function POST(request: NextRequest) {
  try {
    try { validateAWSConfig(); } catch (e) {
      return NextResponse.json({ success: false, error: 'AWS configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { uploadId, s3Key, parts, filename, originalFilename, fileType, fileSize } = body;

    if (!uploadId || !s3Key || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ success: false, error: 'Missing required fields: uploadId, s3Key, parts' }, { status: 400 });
    }

    const sortedParts: CompletedPart[] = parts.sort((a: CompletedPart, b: CompletedPart) => a.PartNumber - b.PartNumber);
    const completeResult = await completeMultipartUpload(s3Key, uploadId, sortedParts);

    if (!completeResult.success) {
      return NextResponse.json({ success: false, error: completeResult.error || 'Failed to complete upload' }, { status: 500 });
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
    return NextResponse.json({ success: false, error: 'Failed to complete upload' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, s3Key } = body;
    if (!uploadId || !s3Key) {
      return NextResponse.json({ success: false, error: 'Missing uploadId or s3Key' }, { status: 400 });
    }
    const result = await abortMultipartUpload(s3Key, uploadId);
    return NextResponse.json({ success: result.success, error: result.error });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to abort upload' }, { status: 500 });
  }
}
