// Shared chunk store for chunked uploads
// In production, use Redis or a database for persistence across instances

export interface ChunkData {
  chunks: (Buffer | null)[];
  metadata: {
    filename: string;
    fileType: string;
    fileSize: number;
    userId: string;
  };
  lastAccess: number;
}

// Global chunk store
const chunkStore = new Map<string, ChunkData>();

// Cleanup old uploads after 30 minutes
const CHUNK_TTL = 30 * 60 * 1000;

export function cleanupOldChunks() {
  const now = Date.now();
  for (const [uploadId, data] of chunkStore.entries()) {
    if (now - data.lastAccess > CHUNK_TTL) {
      chunkStore.delete(uploadId);
    }
  }
}

export function getChunkData(uploadId: string): ChunkData | undefined {
  return chunkStore.get(uploadId);
}

export function setChunkData(uploadId: string, data: ChunkData): void {
  chunkStore.set(uploadId, data);
}

export function deleteChunkData(uploadId: string): boolean {
  return chunkStore.delete(uploadId);
}

export function hasChunkData(uploadId: string): boolean {
  return chunkStore.has(uploadId);
}

// Start cleanup interval (only runs on server)
if (typeof window === 'undefined') {
  setInterval(cleanupOldChunks, 5 * 60 * 1000);
}
