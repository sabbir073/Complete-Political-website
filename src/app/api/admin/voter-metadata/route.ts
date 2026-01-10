import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has moderator+ access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['moderator', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all metadata
    const { data: metadata, error } = await supabase
      .from('voter_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voter metadata:', error);
      return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }

    // Get voter counts for each metadata
    const metadataWithCounts = await Promise.all(
      (metadata || []).map(async (item) => {
        const { count } = await supabase
          .from('voter_list')
          .select('*', { count: 'exact', head: true })
          .eq('voter_metadata_id', item.id);

        return {
          ...item,
          voter_list: [{ count: count || 0 }]
        };
      })
    );

    return NextResponse.json({ metadata: metadataWithCounts });

  } catch (error) {
    console.error('Voter metadata API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();

    // Insert metadata
    const { data: metadata, error } = await supabase
      .from('voter_metadata')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ metadata });

  } catch (error) {
    console.error('Create metadata error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Update metadata
    const { error: updateError } = await supabase
      .from('voter_metadata')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating metadata:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Fetch the updated metadata
    const { data: metadata, error: fetchError } = await supabase
      .from('voter_metadata')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated metadata:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Return without voter count - frontend will refetch all data anyway
    return NextResponse.json({ metadata });

  } catch (error) {
    console.error('Update metadata error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Delete metadata (will cascade delete voters due to foreign key)
    const { error } = await supabase
      .from('voter_metadata')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete metadata error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
