import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  uploadToS3,
  validateAWSConfig,
  initMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
} from '@/lib/aws-s3';

// Supported file types for emergency uploads (includes audio)
const SUPPORTED_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/m4a',
  'audio/mp4',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max for audio
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart upload

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

// POST - Upload emergency audio file (no auth required for emergencies)
// Supports both single file upload and S3 multipart for large files
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

    const contentType = request.headers.get('content-type') || '';

    // Handle JSON requests for multipart upload operations
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action, filename, fileType, fileSize, uploadId, key, partNumber, parts } = body;

      // Initialize multipart upload
      if (action === 'init-multipart') {
        if (!filename || !fileType || !fileSize) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: filename, fileType, fileSize',
          }, { status: 400 });
        }

        const isAudioType = fileType.startsWith('audio/') || SUPPORTED_TYPES.includes(fileType);
        if (!isAudioType) {
          return NextResponse.json({
            success: false,
            error: `Unsupported file type: ${fileType}. Only audio files are allowed.`,
          }, { status: 400 });
        }

        if (fileSize > MAX_FILE_SIZE) {
          return NextResponse.json({
            success: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          }, { status: 400 });
        }

        const s3Key = generateEmergencyS3Key(filename);
        const result = await initMultipartUpload(s3Key, fileType);

        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error,
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          uploadId: result.uploadId,
          key: s3Key,
          chunkSize: CHUNK_SIZE,
        });
      }

      // Complete multipart upload
      if (action === 'complete-multipart') {
        if (!uploadId || !key || !parts) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: uploadId, key, parts',
          }, { status: 400 });
        }

        const result = await completeMultipartUpload(key, uploadId, parts);

        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error,
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          url: result.cloudFrontUrl || result.s3Url,
          s3Key: key,
        });
      }

      // Abort multipart upload
      if (action === 'abort-multipart') {
        if (!uploadId || !key) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: uploadId, key',
          }, { status: 400 });
        }

        await abortMultipartUpload(key, uploadId);
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid action',
      }, { status: 400 });
    }

    // Handle form data upload (single file or multipart chunk)
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid content type. Use multipart/form-data.',
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadId = formData.get('uploadId') as string | null;
    const key = formData.get('key') as string | null;
    const partNumber = formData.get('partNumber') as string | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    // If uploadId and key are provided, this is a multipart chunk upload
    if (uploadId && key && partNumber) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadPart(key, uploadId, parseInt(partNumber), buffer);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        etag: result.etag,
        partNumber: result.partNumber,
      });
    }

    // Single file upload (for smaller files)
    // Check file type - be lenient with audio types
    const isAudioType = file.type.startsWith('audio/') || SUPPORTED_TYPES.includes(file.type);
    if (!isAudioType) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${file.type}. Only audio files are allowed.`,
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }, { status: 400 });
    }

    const s3Key = generateEmergencyS3Key(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use the correct MIME type, defaulting to audio/webm if unknown
    const mimeType = file.type || 'audio/webm';

    const result = await uploadToS3(buffer, s3Key, mimeType);

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
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('Emergency upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }, { status: 500 });
  }
}

// GET - Get upload configuration
export async function GET() {
  try {
    validateAWSConfig();

    return NextResponse.json({
      success: true,
      config: {
        maxFileSize: MAX_FILE_SIZE,
        chunkSize: CHUNK_SIZE,
        supportedTypes: SUPPORTED_TYPES,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'AWS not configured',
      config: {
        maxFileSize: MAX_FILE_SIZE,
        chunkSize: CHUNK_SIZE,
        supportedTypes: SUPPORTED_TYPES,
      },
    });
  }
}
