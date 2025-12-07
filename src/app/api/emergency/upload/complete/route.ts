import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';
import {
  getChunkData,
  deleteChunkData,
} from '@/lib/chunk-store';

// Generate S3 key for emergency audio uploads
function generateEmergencyS3Key(filename: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop() || 'webm';
  const safeName = filename.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);

  return `emergency-audio/${year}/${month}/${day}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

// POST - Complete chunked upload (no auth required for emergencies)
export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      console.error('AWS config error:', configError);
      return NextResponse.json({
        success: false,
        error: 'Server configuration error',
      }, { status: 500 });
    }

    const { uploadId, filename } = await request.json();

    if (!uploadId) {
      return NextResponse.json({
        success: false,
        error: 'Upload ID is required',
      }, { status: 400 });
    }

    // Get chunk data
    const chunkData = getChunkData(uploadId);

    if (!chunkData) {
      return NextResponse.json({
        success: false,
        error: 'Upload not found or expired',
      }, { status: 404 });
    }

    // Check if all chunks are received
    const missingChunks = chunkData.chunks.findIndex(c => c === null);
    if (missingChunks !== -1) {
      return NextResponse.json({
        success: false,
        error: `Missing chunk at index ${missingChunks}`,
      }, { status: 400 });
    }

    // Combine all chunks
    const fileBuffer = Buffer.concat(chunkData.chunks as Buffer[]);

    // Generate S3 key
    const finalFilename = filename || chunkData.metadata.filename;
    const s3Key = generateEmergencyS3Key(finalFilename);

    // Use the correct MIME type, defaulting to audio/webm if unknown
    const mimeType = chunkData.metadata.fileType || 'audio/webm';

    // Upload to S3
    const result = await uploadToS3(fileBuffer, s3Key, mimeType);

    // Clean up chunk data
    deleteChunkData(uploadId);

    if (!result.success) {
      console.error('S3 upload error:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Upload failed',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.cloudFrontUrl || result.s3Url,
      s3Key,
      filename: finalFilename,
      fileType: mimeType,
      fileSize: fileBuffer.length,
    });

  } catch (error) {
    console.error('Emergency complete upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete upload',
    }, { status: 500 });
  }
}
