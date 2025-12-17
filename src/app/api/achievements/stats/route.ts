import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get achievements statistics
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('impact_metrics')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching achievement stats:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate impact metrics
    let totalPeopleHelped = 0;
    let totalInvestment = 0;
    let totalProjects = achievements?.length || 0;

    achievements?.forEach(a => {
      if (a.impact_metrics) {
        const metrics = a.impact_metrics as { people_helped?: number; investment?: number };
        totalPeopleHelped += metrics.people_helped || 0;
        totalInvestment += metrics.investment || 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        totalPeopleHelped,
        totalInvestment,
        yearsOfService: new Date().getFullYear() - 2018 // Started in 2018
      }
    });
  } catch (error) {
    console.error('Error in achievement stats GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    }, { status: 500 });
  }
}
