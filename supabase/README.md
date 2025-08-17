# Enterprise Database Setup

## Overview
This is an enterprise-grade application that uses API-based database access, bypassing RLS for optimal performance.

## Database Files
- `schema.sql` - Core database schema
- `reset-and-create-admin.sql` - Complete reset with admin setup

## Admin Access
- **Email**: `md.sabbir073@gmail.com`
- **Password**: `sabbir1love`
- **Role**: Admin

## Architecture
- ✅ API-first design (`/api/admin/*`)
- ✅ Server-side database operations
- ✅ Enterprise caching and performance optimization
- ✅ No RLS dependencies - works regardless of policies

## Quick Setup
1. Run `reset-and-create-admin.sql` in Supabase SQL Editor
2. Deploy the application
3. Login with admin credentials

## Note
The application handles all database operations through secure API endpoints, ensuring enterprise-grade reliability and performance.