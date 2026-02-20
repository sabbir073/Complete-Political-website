import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, validateAWSConfig, getCloudFrontUrl } from '@/lib/aws-s3';

const SUPPORTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm',
];
const MAX_FILE_SIZE = 200 * 1024 * 1024;

function generateS3Key(filename: string, fileType: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const uuid = uuidv4().slice(0, 8);
  const timestamp = Date.now();
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const safeName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
  const type = fileType.startsWith('video/') ? 'videos' : 'images';
  return `challenges/${type}/${year}/${month}/${timestamp}-${uuid}-${safeName}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    try { validateAWSConfig(); } catch {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 200MB' }, { status: 400 });
    }

    const s3Key = generateS3Key(file.name, file.type);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadToS3(buffer, s3Key, file.type);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
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
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
