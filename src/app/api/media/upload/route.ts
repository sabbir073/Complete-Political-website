import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { uploadToS3, validateAWSConfig } from '@/lib/aws-s3';
import { 
  validateFile, 
  generateFileName, 
  generateS3Key, 
  fileToBuffer,
  getFileTypeFromMime 
} from '@/lib/media-utils';
import { BatchUploadResponse } from '@/types/media.types';

export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    try {
      validateAWSConfig();
    } catch (configError) {
      return NextResponse.json({ 
        success: false,
        message: 'AWS configuration error. Please check environment variables.',
        error: configError instanceof Error ? configError.message : 'Configuration error'
      }, { status: 500 });
    }

    // Use regular client for auth check
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized',
        error: authError?.message || 'No user found'
      }, { status: 401 });
    }

    // Use the RPC function to get user role (avoids RLS recursion)
    const { data: userRole, error: roleError } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    // Check if user has permission
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Insufficient permissions',
        error: `User role '${userRole}' is not allowed to upload media`
      }, { status: 403 });
    }

    // Use service client for database operations (bypasses RLS)
    const serviceClient = createServiceClient();

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No files provided' 
      }, { status: 400 });
    }

    const results: BatchUploadResponse['results'] = [];

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

        // Get file dimensions/duration (basic info)
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        // For images, we'll get dimensions on the client side
        // For videos, we'll get duration on the client side
        // Server-side media processing can be added later if needed

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
            width,
            height,
            duration,
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

    const response: BatchUploadResponse = {
      success: successCount > 0,
      results,
      message: `${successCount}/${totalCount} files uploaded successfully`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get upload status or presigned URL (alternative upload method)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This could be used for getting upload progress or presigned URLs
    // For now, return basic upload configuration
    return NextResponse.json({
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxVideoSize: 100 * 1024 * 1024, // 100MB
      supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      supportedVideoTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'],
      awsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    });

  } catch (error) {
    console.error('Upload config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}