import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getChunkData,
  setChunkData,
  hasChunkData,
  ChunkData
} from '@/lib/chunk-store';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// POST - Upload a chunk
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as File;
    const uploadId = formData.get('uploadId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const filename = formData.get('filename') as string;
    const fileType = formData.get('fileType') as string;
    const fileSize = parseInt(formData.get('fileSize') as string);

    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create chunk store entry
    if (!hasChunkData(uploadId)) {
      const newData: ChunkData = {
        chunks: new Array(totalChunks).fill(null),
        metadata: { filename, fileType, fileSize, userId: user.id },
        lastAccess: Date.now()
      };
      setChunkData(uploadId, newData);
    }

    const uploadData = getChunkData(uploadId)!;
    uploadData.lastAccess = Date.now();

    // Store chunk
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    uploadData.chunks[chunkIndex] = chunkBuffer;

    // Update the store
    setChunkData(uploadId, uploadData);

    // Count received chunks
    const receivedChunks = uploadData.chunks.filter(c => c !== null).length;

    return NextResponse.json({
      success: true,
      uploadId,
      chunkIndex,
      receivedChunks,
      totalChunks,
      complete: receivedChunks === totalChunks
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}

// GET - Check upload status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    const uploadData = getChunkData(uploadId);

    if (!uploadData) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    const receivedChunks = uploadData.chunks.filter(c => c !== null).length;
    const totalChunks = uploadData.chunks.length;

    return NextResponse.json({
      uploadId,
      receivedChunks,
      totalChunks,
      complete: receivedChunks === totalChunks,
      metadata: uploadData.metadata
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
