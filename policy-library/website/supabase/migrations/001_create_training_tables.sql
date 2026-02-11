-- Supabase Training System Migration
-- Creates tables for user training progress, policy acknowledgments, module completions, and training sessions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profile Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  department TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Training Progress Table
CREATE TABLE IF NOT EXISTS public.training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  policies_completed INTEGER DEFAULT 0,
  hipaa_101_complete BOOLEAN DEFAULT FALSE,
  cybersecurity_complete BOOLEAN DEFAULT FALSE,
  overall_percentage INTEGER DEFAULT 0,
  current_step TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Policy Acknowledgments Table
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id TEXT NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, policy_id)
);

-- 4. Module Completions Table
CREATE TABLE IF NOT EXISTS public.module_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quiz_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_name)
);

-- 5. Training Sessions Table
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_position TEXT,
  last_module TEXT,
  scroll_position INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON public.training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user_id ON public.policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_policy_id ON public.policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON public.module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_module_name ON public.module_completions(module_name);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON public.training_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data

-- Users Table Policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Training Progress Policies
CREATE POLICY "Users can view their own training progress"
  ON public.training_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress"
  ON public.training_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training progress"
  ON public.training_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy Acknowledgments Policies
CREATE POLICY "Users can view their own policy acknowledgments"
  ON public.policy_acknowledgments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy acknowledgments"
  ON public.policy_acknowledgments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Module Completions Policies
CREATE POLICY "Users can view their own module completions"
  ON public.module_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions"
  ON public.module_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions"
  ON public.module_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Training Sessions Policies
CREATE POLICY "Users can view their own training sessions"
  ON public.training_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training sessions"
  ON public.training_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sessions"
  ON public.training_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create Trigger Function to Auto-Update updated_at Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger to Tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON public.training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
