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
    const areaId = searchParams.get('areaId') || '';

    // Validate required fields - dateOfBirth and wardId are mandatory
    if (!dateOfBirth || !wardId) {
      return NextResponse.json({
        error: 'জন্ম তারিখ এবং ওয়ার্ড নির্বাচন আবশ্যক'
      }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('voter_list')
      .select('*, voter_metadata(*)', { count: 'exact' });

    // Apply ward filter (metadata)
    if (wardId) {
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

    // Apply area filter (optional) - this filters by voter_area_no within metadata
    if (areaId) {
      // We need to filter voters whose metadata has this area
      query = query.eq('voter_metadata_id', areaId);
    }

    // Order by serial number
    query = query.order('serial_no', { ascending: true });

    // Limit results
    query = query.limit(100);

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
