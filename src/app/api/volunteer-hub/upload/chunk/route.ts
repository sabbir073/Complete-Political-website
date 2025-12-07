import { NextRequest, NextResponse } from 'next/server';
import {
  getChunkData,
  setChunkData,
  ChunkData,
} from '@/lib/chunk-store';

// Supported image types for volunteer photos
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max for photos (increased for chunked)

// POST - Upload a chunk
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid content type',
      }, { status: 400 });
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob | null;
    const uploadId = formData.get('uploadId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const filename = formData.get('filename') as string;
    const fileType = formData.get('fileType') as string;
    const fileSize = parseInt(formData.get('fileSize') as string);

    // Validate required fields
    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !filename) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${fileType}. Supported types: JPEG, PNG, WebP`,
      }, { status: 400 });
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }, { status: 400 });
    }

    // Get or create chunk data
    let chunkData = getChunkData(uploadId);

    if (!chunkData) {
      // Initialize new upload
      chunkData = {
        chunks: new Array(totalChunks).fill(null),
        metadata: {
          filename,
          fileType,
          fileSize,
          userId: 'volunteer', // No auth for volunteer photos
        },
        lastAccess: Date.now(),
      };
    }

    // Store the chunk
    const buffer = Buffer.from(await chunk.arrayBuffer());
    chunkData.chunks[chunkIndex] = buffer;
    chunkData.lastAccess = Date.now();
    setChunkData(uploadId, chunkData);

    // Count received chunks
    const receivedChunks = chunkData.chunks.filter(c => c !== null).length;

    return NextResponse.json({
      success: true,
      uploadId,
      chunkIndex,
      receivedChunks,
      totalChunks,
      progress: Math.round((receivedChunks / totalChunks) * 100),
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Chunk upload failed',
    }, { status: 500 });
  }
}
