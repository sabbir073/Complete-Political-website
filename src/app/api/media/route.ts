import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { MediaFilter, MediaLibraryResponse } from '@/types/media.types';

// GET - Fetch media library with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('fileType') as 'image' | 'video' | 'all' || 'all';
    const search = searchParams.get('search') || '';
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
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
      .order('created_at', { ascending: false });

    // Apply filters
    if (fileType !== 'all') {
      query = query.eq('file_type', fileType);
    }

    if (search) {
      query = query.or(`original_filename.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`);
    }

    // Apply date filters (WordPress style)
    if (year && month) {
      // Filter by specific month and year
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query = query.gte('created_at', startDate).lt('created_at', `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`);
    } else if (year) {
      // Filter by year only
      const startDate = `${year}-01-01`;
      const endDate = `${parseInt(year) + 1}-01-01`;
      query = query.gte('created_at', startDate).lt('created_at', endDate);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('media_library')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }

    const response: MediaLibraryResponse = {
      items: items || [],
      total: count || 0,
      hasMore: offset + limit < (count || 0),
      page,
      limit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete media item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin/moderator role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions using the RPC function to avoid RLS recursion
    const { data: userRole, error: roleError } = await supabase
      .rpc('get_user_role', { user_id: user.id });

    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Use service client for database operations to bypass RLS
    const serviceClient = createServiceClient();

    // Get media item to get S3 key
    const { data: mediaItem, error: fetchError } = await serviceClient
      .from('media_library')
      .select('s3_key, filename')
      .eq('id', mediaId)
      .single();

    if (fetchError || !mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    // Delete from database first
    const { error: dbError } = await serviceClient
      .from('media_library')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 });
    }

    // Delete from S3 (optional - could be done in background)
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