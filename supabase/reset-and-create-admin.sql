-- 🚀 COMPLETE DATABASE RESET & ADMIN SETUP
-- This script will empty all tables and create a fresh admin user
-- Email: md.sabbir073@gmail.com
-- Password: sabbir1love

-- ==========================================
-- STEP 1: CLEAN EVERYTHING
-- ==========================================

-- Disable RLS temporarily for cleanup
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Delete all profiles first (this will cascade delete auth users due to foreign key)
DELETE FROM public.profiles WHERE true;

-- Clean up any remaining auth users (in case of orphaned records)
DELETE FROM auth.users WHERE true;

-- Reset any sequences or auto-increment counters
-- (Add any other tables you have here)

-- ==========================================
-- STEP 2: RECREATE TABLE STRUCTURE
-- ==========================================

-- Ensure user_role enum exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate profiles table for clean state
DROP TABLE IF EXISTS public.profiles;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- STEP 3: SETUP TRIGGERS & FUNCTIONS
-- ==========================================

-- Create or replace the trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- STEP 4: SETUP RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() IS NULL  -- Allow system inserts
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow system/trigger to insert profiles
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- STEP 5: GRANT PERMISSIONS
-- ==========================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Create indexes for performance
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_active_idx ON public.profiles(is_active);

-- ==========================================
-- STEP 6: CREATE ADMIN USER
-- ==========================================

-- Insert admin user directly into auth.users (this will trigger profile creation)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'md.sabbir073@gmail.com',
  crypt('sabbir1love', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NOW(),
  '',
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "S M JAHANGIR HOSSAIN", "role": "admin"}',
  false,
  NOW(),
  NOW(),
  null,
  null,
  '',
  '',
  NOW(),
  '',
  0,
  null,
  '',
  NOW()
);

-- Get the created user ID and update the profile to ensure admin role
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID we just created
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'md.sabbir073@gmail.com';
    
    -- Update/Insert profile to ensure admin role
    INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
        admin_user_id,
        'md.sabbir073@gmail.com',
        'S M JAHANGIR HOSSAIN',
        'admin',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'S M JAHANGIR HOSSAIN',
        role = 'admin',
        is_active = true,
        updated_at = NOW();
        
    RAISE NOTICE '✅ Admin user created successfully!';
    RAISE NOTICE '📧 Email: md.sabbir073@gmail.com';
    RAISE NOTICE '🔑 Password: sabbir1love';
    RAISE NOTICE '👑 Role: admin';
    RAISE NOTICE '🆔 User ID: %', admin_user_id;
END $$;

-- ==========================================
-- STEP 7: VERIFICATION
-- ==========================================

-- Show the created user
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at,
    CASE 
        WHEN u.id IS NOT NULL THEN 'Auth user exists'
        ELSE 'Auth user missing'
    END as auth_status
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.email = 'md.sabbir073@gmail.com';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE RESET COMPLETE!';
    RAISE NOTICE '✅ All tables emptied and recreated';
    RAISE NOTICE '👑 Admin user created: md.sabbir073@gmail.com';
    RAISE NOTICE '🔐 Password: sabbir1love';
    RAISE NOTICE '🛡️ RLS policies configured';
    RAISE NOTICE '⚡ Triggers and functions ready';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for enterprise user management!';
END $$;