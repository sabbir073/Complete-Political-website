/* eslint-disable @typescript-eslint/no-explicit-any */
// 🏢 ENTERPRISE PROFILE MANAGEMENT API
// Server-side profile operations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
}

// Server-side Supabase client with service role key
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

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