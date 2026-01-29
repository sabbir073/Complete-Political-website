import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all voter metadata (wards/areas)
    const { data: wards, error } = await supabase
      .from('voter_metadata')
      .select('id, voter_area_name, voter_area_no, union_pouro_ward_cant_board, ward_no_for_union')
      .order('voter_area_no', { ascending: true });

    if (error) {
      console.error('Error fetching wards:', error);
      return NextResponse.json({ error: 'ওয়ার্ড তালিকা লোড করতে সমস্যা হয়েছে' }, { status: 500 });
    }

    return NextResponse.json({
      wards: wards || [],
    });

  } catch (error) {
    console.error('Wards API error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
