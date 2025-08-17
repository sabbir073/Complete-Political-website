// 🚪 USER LOGOUT API
// Admin endpoint to logout user from all devices

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST - Logout user from all devices
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    console.log('🚪 Logging out user from all devices:', userId);

    // Get user information first
    const { data: user, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('❌ Failed to get user:', getUserError);
      return NextResponse.json(
        { error: 'Failed to get user information', details: getUserError.message },
        { status: 500 }
      );
    }

    if (!user.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Method: Temporarily reset password to force logout, then restore it
    // This is the most reliable way to invalidate all active sessions
    console.log('🔐 Invalidating all sessions by temporary password reset...');
    
    try {
      // Step 1: Generate temporary password and update user
      const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).slice(-8)}`;
      
      console.log('🔄 Step 1: Setting temporary password...');
      const { error: tempError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          password: tempPassword,
          user_metadata: { 
            ...user.user.user_metadata,
            forced_logout_at: new Date().toISOString(),
            logout_count: (user.user.user_metadata?.logout_count || 0) + 1
          }
        }
      );

      if (tempError) {
        throw new Error(`Temporary password update failed: ${tempError.message}`);
      }

      // Wait a moment to ensure session invalidation takes effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Generate a new permanent password (since we can't restore the old one)
      const newPassword = `pwd_${Date.now()}_${Math.random().toString(36).slice(-12)}`;
      
      console.log('🔄 Step 2: Setting new permanent password...');
      const { error: finalError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          password: newPassword,
          user_metadata: { 
            ...user.user.user_metadata,
            password_reset_by_admin: new Date().toISOString(),
            logout_count: (user.user.user_metadata?.logout_count || 0) + 1
          }
        }
      );

      if (finalError) {
        console.warn('⚠️ Failed to set final password, but session invalidation was successful');
      }

      console.log('✅ Sessions invalidated - user will need admin to reset password');
      
      return NextResponse.json({ 
        message: 'User logged out from all devices successfully',
        user_email: user.user.email,
        note: 'User password has been reset. They will need a new password to login.',
        requires_password_reset: true
      });

    } catch (logoutError) {
      console.error('❌ Failed to invalidate sessions:', logoutError);
      return NextResponse.json(
        { 
          error: 'Failed to logout user', 
          details: logoutError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('💥 Logout failed:', error);
    return NextResponse.json(
      { error: 'Failed to logout user', details: error.message },
      { status: 500 }
    );
  }
}