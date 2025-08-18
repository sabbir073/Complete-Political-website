/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// 🏢 USER MANAGEMENT API
// Real database operations with service role access

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// bcrypt import removed - using Supabase Auth API instead

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
}

// Server-side Supabase client with service role key (bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

// Password hashing handled by Supabase Auth API

// GET - Fetch all users from database with auth data
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('🔍 Fetching all users from database...');

    // Direct database query with service role (bypasses RLS)
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    // Enrich with auth data
    const enrichedUsers = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          // Get auth user data including last_sign_in_at
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          if (!authError && authUser.user) {
            return {
              ...profile,
              last_sign_in_at: authUser.user.last_sign_in_at,
              email_confirmed_at: authUser.user.email_confirmed_at,
            };
          }
        } catch (authError) {
          // Silently handle auth data fetch errors
        }
        
        // Return profile without auth data if fetch failed
        return profile;
      })
    );

    console.log(`✅ Found ${enrichedUsers?.length || 0} users in database`);
    
    return NextResponse.json({ 
      users: enrichedUsers || [],
      message: 'Users fetched successfully from database'
    });

  } catch (error: any) {
    console.error('💥 Failed to fetch users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Create new user with both auth and profile
export async function POST(request: NextRequest) {
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
    const { email, password, full_name, role, is_active } = body;

    console.log('🏗️ Creating new user with auth:', email);

    // Step 1: Create auth user using admin API
    console.log('🔐 Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        role,
        created_via_admin: true
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      
      if (authError.message?.includes('already been registered')) {
        throw new Error('A user with this email already exists');
      }
      
      throw new Error(`Auth error: ${authError.message}`);
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Step 2: Create profile (this will be handled by the trigger, but let's ensure it exists)
    console.log('📝 Ensuring profile exists...');
    
    // Check if profile was created by trigger
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // If profile doesn't exist (trigger might have failed), create it manually
    if (!profile || profileError) {
      console.log('🔧 Profile not found, creating manually...');
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role,
          is_active: is_active ?? true,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Manual profile creation failed:', createError);
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Profile creation failed: ${createError.message}`);
      }
      
      profile = newProfile;
    }

    console.log(`✅ Complete user created: ${profile.full_name} (${profile.role})`);
    return NextResponse.json({ 
      user: profile,
      auth_user_id: authData.user.id,
      message: 'User created successfully with authentication enabled',
    });

  } catch (error: any) {
    console.error('💥 User creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}