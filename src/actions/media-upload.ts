'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';
import {
  validateFile,
  generateFileName,
  generateS3Key,
  fileToBuffer
} from '@/lib/media-utils';

export interface UploadResult {
  filename: string;
  success: boolean;
  error?: string;
  mediaItem?: any;
}

export interface UploadResponse {
  success: boolean;
  results: UploadResult[];
  message: string;
}

export async function uploadMedia(formData: FormData): Promise<UploadResponse> {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      return {
        success: false,
        results: [],
        message: configError instanceof Error ? configError.message : 'AWS configuration error'
      };
    }

    // Use regular client for auth check
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        results: [],
        message: 'Unauthorized'
      };
    }

    // Use the RPC function to get user role (avoids RLS recursion)
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    // Check if user has permission
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return {
        success: false,
        results: [],
        message: 'Insufficient permissions'
      };
    }

    // Use service client for database operations (bypasses RLS)
    const serviceClient = createServiceClient();

    // Parse form data
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return {
        success: false,
        results: [],
        message: 'No files provided'
      };
    }

    const results: UploadResult[] = [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.isValid) {
          results.push({
            filename: file.name,
            success: false,
            error: validation.errors.join(', ')
          });
          continue;
        }

        // Generate unique filename and S3 key
        const filename = generateFileName(file.name);
        const s3Key = generateS3Key(filename, validation.fileType as 'image' | 'video');

        // Convert file to buffer
        const buffer = await fileToBuffer(file);

        // Upload to S3
        const uploadResult = await uploadToS3(buffer, s3Key, file.type);

        if (!uploadResult.success) {
          results.push({
            filename: file.name,
            success: false,
            error: uploadResult.error || 'Upload failed'
          });
          continue;
        }

        // Save to database using service client to bypass RLS
        const { data: mediaItem, error: dbError } = await serviceClient
          .from('media_library')
          .insert({
            filename,
            original_filename: file.name,
            file_type: validation.fileType,
            mime_type: file.type,
            file_size: file.size,
            s3_key: s3Key,
            s3_url: uploadResult.s3Url!,
            cloudfront_url: uploadResult.cloudFrontUrl,
            uploaded_by: user.id
          })
          .select()
          .single();

        if (dbError) {
          // Try to clean up S3 file
          try {
            const { deleteFromS3 } = await import('@/lib/aws-s3');
            await deleteFromS3(s3Key);
          } catch (cleanupError) {
            console.error('S3 cleanup error:', cleanupError);
          }

          results.push({
            filename: file.name,
            success: false,
            error: 'Failed to save to database'
          });
          continue;
        }

        results.push({
          filename: file.name,
          success: true,
          mediaItem
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        results.push({
          filename: file.name,
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Processing failed'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      results,
      message: `${successCount}/${totalCount} files uploaded successfully`
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      results: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
