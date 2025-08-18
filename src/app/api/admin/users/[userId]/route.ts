/* eslint-disable @typescript-eslint/no-explicit-any */
// 🏢 USER OPERATIONS API
// Individual user update and delete operations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// PUT - Update user in database
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    
    console.log('🔄 Updating user:', userId);

    // Update password if provided
    if (body.password) {
      console.log('🔐 Updating user password...');
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: body.password }
      );

      if (authError) {
        console.error('❌ Password update failed:', authError);
        throw new Error(`Password update failed: ${authError.message}`);
      }
      console.log('✅ Password updated successfully');
    }

    // Update profile using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: body.full_name,
        role: body.role,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }

    console.log(`✅ User profile updated: ${data.full_name}`);
    return NextResponse.json({ 
      profile: data, 
      message: body.password 
        ? 'User updated successfully (including password)' 
        : 'User updated successfully' 
    });

  } catch (error: any) {
    console.error('💥 Update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete user from database and auth
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { userId } = await params;
    
    console.log('🗑️ Deleting user:', userId);

    // Delete from profiles using service role (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Profile deletion failed:', profileError);
      throw profileError;
    }

    // Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.warn('⚠️ Auth deletion warning:', authError);
      // Don't throw error as profile is already deleted
    }

    console.log('✅ User deleted successfully');
    return NextResponse.json({ 
      message: 'User deleted successfully' 
    });

  } catch (error: any) {
    console.error('💥 Delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}