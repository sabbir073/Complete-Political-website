import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get promises statistics
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: promises, error } = await supabase
      .from('promises')
      .select('status, progress')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching promise stats:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const stats = {
      total: promises?.length || 0,
      completed: promises?.filter(p => p.status === 'completed').length || 0,
      inProgress: promises?.filter(p => p.status === 'in_progress').length || 0,
      notStarted: promises?.filter(p => p.status === 'not_started').length || 0,
      delayed: promises?.filter(p => p.status === 'delayed').length || 0,
      averageProgress: promises?.length
        ? Math.round(promises.reduce((sum, p) => sum + (p.progress || 0), 0) / promises.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in promise stats GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    }, { status: 500 });
  }
}
