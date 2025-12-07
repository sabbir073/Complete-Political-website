import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';

// Supported image types for volunteer photos - only PNG and JPG
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max for photos

// Generate S3 key for volunteer photos
function generateVolunteerS3Key(filename: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);

  return `volunteer/${year}/${month}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

// POST - Upload volunteer photo
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

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid content type. Use multipart/form-data',
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    // Validate file type - only PNG and JPG
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `Only PNG and JPG files are accepted. Your file type: ${file.type}`,
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }, { status: 400 });
    }

    // Generate S3 key
    const s3Key = generateVolunteerS3Key(file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const result = await uploadToS3(buffer, s3Key, file.type);

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
    console.error('Volunteer photo upload error:', error);
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
        supportedTypes: SUPPORTED_TYPES,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'AWS not configured',
      config: {
        maxFileSize: MAX_FILE_SIZE,
        supportedTypes: SUPPORTED_TYPES,
      },
    });
  }
}
