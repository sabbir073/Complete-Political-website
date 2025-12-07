import { NextRequest, NextResponse } from 'next/server';
import {
  getChunkData,
  setChunkData,
  ChunkData,
} from '@/lib/chunk-store';

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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max for audio (increased for chunked)

// POST - Upload a chunk (no auth required for emergencies)
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

    // Check file type - be lenient with audio types
    const isAudioType = fileType.startsWith('audio/') || SUPPORTED_TYPES.includes(fileType);
    if (!isAudioType) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${fileType}. Only audio files are allowed.`,
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
          fileType: fileType || 'audio/webm',
          fileSize,
          userId: 'emergency', // No auth for emergencies
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
    console.error('Emergency chunk upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Chunk upload failed',
    }, { status: 500 });
  }
}
