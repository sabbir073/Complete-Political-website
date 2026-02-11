import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const voterName = searchParams.get('voterName') || '';
    const dateOfBirth = searchParams.get('dateOfBirth') || '';
    const wardId = searchParams.get('wardId') || '';
    const wardName = searchParams.get('wardName') || '';
    const areaId = searchParams.get('areaId') || '';

    // Validate required fields - dateOfBirth and ward (Id or Name) are mandatory
    if (!dateOfBirth || (!wardId && !wardName)) {
      return NextResponse.json({
        error: 'জন্ম তারিখ এবং ওয়ার্ড নির্বাচন আবশ্যক'
      }, { status: 400 });
    }

    // Build query
    // Note: We need !inner join to filter by metadata column if using wardName
    let selectQuery = '*, voter_metadata(*)';
    if (wardName) {
      selectQuery = '*, voter_metadata!inner(*)';
    }

    let query = supabase
      .from('voter_list')
      .select(selectQuery); // Removed count: 'exact' for performance

    // Apply ward filter (metadata)
    if (wardName) {
      query = query.eq('voter_metadata.union_pouro_ward_cant_board', wardName);
    } else if (wardId) {
      query = query.eq('voter_metadata_id', wardId);
    }

    // Apply date of birth filter
    if (dateOfBirth) {
      query = query.eq('date_of_birth', dateOfBirth);
    }

    // Apply voter name filter (optional)
    if (voterName) {
      query = query.ilike('voter_name', `%${voterName}%`);
    }

    // Apply area filter (optional)
    if (areaId) {
      query = query.eq('voter_metadata_id', areaId);
    }

    // Removed default sorting by serial_no to avoid full table scan/sort overhead

    const { data: voters, error, count } = await query;

    if (error) {
      console.error('Error searching voters:', error);
      return NextResponse.json({ error: 'ভোটার অনুসন্ধানে সমস্যা হয়েছে' }, { status: 500 });
    }

    return NextResponse.json({
      voters: voters || [],
      total: count || 0,
    });

  } catch (error) {
    console.error('Voter search API error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
