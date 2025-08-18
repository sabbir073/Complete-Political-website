/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { MediaUpdateData } from '@/types/media.types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get single media item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: mediaItem, error } = await supabase
      .from('media_library')
      .select(`
        id,
        filename,
        original_filename,
        file_type,
        mime_type,
        file_size,
        s3_key,
        s3_url,
        cloudfront_url,
        alt_text,
        caption,
        description,
        width,
        height,
        duration,
        uploaded_by,
        created_at,
        updated_at
      `)
      .eq('id', params.id)
      .single();

    if (error || !mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    return NextResponse.json(mediaItem);

  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update media item metadata
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions using RPC function
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const updateData: MediaUpdateData = await request.json();

    // Validate update data
    const allowedFields = ['alt_text', 'caption', 'description'];
    const filteredData: Record<string, any> = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    filteredData.updated_at = new Date().toISOString();

    // Update in database
    const { data: updatedItem, error } = await supabase
      .from('media_library')
      .update(filteredData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
    }

    if (!updatedItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Media item updated successfully',
      mediaItem: updatedItem
    });

  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete single media item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions using RPC function
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Use service client for database operations
    const serviceClient = createServiceClient();

    // Get media item to get S3 key
    const { data: mediaItem, error: fetchError } = await serviceClient
      .from('media_library')
      .select('s3_key, filename')
      .eq('id', params.id)
      .single();

    if (fetchError || !mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    // Delete from database
    const { error: dbError } = await serviceClient
      .from('media_library')
      .delete()
      .eq('id', params.id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 });
    }

    // Delete from S3 (in background)
    try {
      const { deleteFromS3 } = await import('@/lib/aws-s3');
      await deleteFromS3(mediaItem.s3_key);
    } catch (s3Error) {
      console.error('S3 delete error:', s3Error);
      // Don't fail the request if S3 delete fails
    }

    return NextResponse.json({
      success: true,
      message: `Media item "${mediaItem.filename}" deleted successfully`
    });

  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}