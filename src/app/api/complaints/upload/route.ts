import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  uploadToS3,
  initMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
  validateAWSConfig,
  getCloudFrontUrl,
} from '@/lib/aws-s3';

// Supported file types for complaints
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/quicktime',
  'video/webm',
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB max
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart upload

// Generate S3 key for complaint attachments
function generateComplaintS3Key(filename: string, fileType: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop() || '';
  const safeName = filename.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
  const type = fileType.startsWith('video/') ? 'videos' : 'images';

  return `complaints/${type}/${year}/${month}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

// POST - Upload file (single or initiate multipart)
export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error',
      }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Check if this is a multipart upload initiation request
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

        if (!SUPPORTED_TYPES.includes(fileType)) {
          return NextResponse.json({
            success: false,
            error: `Unsupported file type: ${fileType}`,
          }, { status: 400 });
        }

        if (fileSize > MAX_FILE_SIZE) {
          return NextResponse.json({
            success: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          }, { status: 400 });
        }

        const s3Key = generateComplaintS3Key(filename, fileType);
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

      // Upload a part (for multipart upload)
      if (action === 'upload-part') {
        // This should be handled by the formdata route below
        return NextResponse.json({
          success: false,
          error: 'Use multipart/form-data for uploading parts',
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid action',
      }, { status: 400 });
    }

    // Handle form data upload (single file or multipart chunk)
    if (contentType.includes('multipart/form-data')) {
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
      if (!SUPPORTED_TYPES.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: `Unsupported file type: ${file.type}`,
        }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        }, { status: 400 });
      }

      const s3Key = generateComplaintS3Key(file.name, file.type);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToS3(buffer, s3Key, file.type);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error,
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
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid content type',
    }, { status: 400 });

  } catch (error) {
    console.error('Complaint upload error:', error);
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
        maxFiles: 5,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'AWS not configured',
      config: {
        maxFileSize: MAX_FILE_SIZE,
        chunkSize: CHUNK_SIZE,
        supportedTypes: SUPPORTED_TYPES,
        maxFiles: 5,
      },
    });
  }
}
