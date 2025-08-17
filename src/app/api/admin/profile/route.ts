// 🏢 ENTERPRISE PROFILE MANAGEMENT API
// Server-side profile operations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, full_name } = body;

    if (!userId || !full_name) {
      return NextResponse.json(
        { error: 'User ID and full name are required' },
        { status: 400 }
      );
    }

    console.log('🏢 API: Updating profile for user:', userId);

    // Update profile in database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }

    console.log('✅ Profile updated successfully');
    return NextResponse.json({ 
      profile, 
      message: 'Profile updated successfully' 
    });

  } catch (error: any) {
    console.error('💥 Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}