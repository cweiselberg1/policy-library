# Supabase Setup Complete

## Files Created

### Core Configuration
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components and API routes
- `lib/supabase/middleware.ts` - Auth middleware for session management
- `lib/supabase/auth.ts` - Authentication helper functions
- `middleware.ts` - Root middleware for session refresh

### Types
- `types/database.ts` - TypeScript types for database schema

### Configuration
- `.env.local.example` - Example environment variables (updated with Supabase vars)
- `package.json` - Updated with Supabase dependencies

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering helpers for Next.js

### 2. Set Up Supabase Project
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to Settings > API
4. Copy your project URL and anon key

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Create Database Schema
Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Course progress table
CREATE TABLE course_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  completed_lessons TEXT[] DEFAULT '{}',
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Certificates table
CREATE TABLE certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_course_progress_user ON course_progress(user_id);
CREATE INDEX idx_course_progress_course ON course_progress(course_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Course progress policies
CREATE POLICY "Users can view own progress" ON course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Usage Examples

### Client Component (Browser)
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { signIn, signUp, signOut } from '@/lib/supabase/auth'

export default function AuthComponent() {
  const handleSignUp = async () => {
    const { data, error } = await signUp(
      'user@example.com',
      'password123',
      { full_name: 'John Doe', organization: 'Acme Corp' }
    )
  }

  const handleSignIn = async () => {
    const { data, error } = await signIn('user@example.com', 'password123')
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
  }

  return (
    <div>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <div>Welcome {profile?.full_name}</div>
}
```

### API Route
```tsx
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({ data })
}
```

## Features Included

### Authentication
- Email/password sign up
- Email/password sign in
- Sign out
- Session management
- Password reset
- Auto-refresh sessions via middleware

### User Management
- User profiles with metadata
- Profile updates
- Organization and role tracking

### Course Progress
- Track completed lessons
- Progress percentage
- Course completion timestamps

### Certificates
- Certificate generation tracking
- User certificate history

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on signup
- Secure cookie-based sessions
- Service role key for admin operations

## TypeScript Support

Full TypeScript support with generated types for:
- Database schema
- Query results
- Insert/update operations
- Type-safe client methods

## Ready to Build

All configuration is complete. Just run `npm install` and add your Supabase credentials to `.env.local`.
