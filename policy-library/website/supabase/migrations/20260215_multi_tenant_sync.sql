-- Multi-Tenant Sync Migration
-- Creates profiles table (if missing), adds organization_id FK, creates org_data KV table with RLS

-- 0. Ensure profiles table exists (Supabase Auth creates auth.users but not public.profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users can read/update their own profile
DO $$ BEGIN
  CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'privacy_officer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Add organization_id FK to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 2. Create org_data key-value table
CREATE TABLE IF NOT EXISTS org_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  data_key TEXT NOT NULL,
  data_value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, data_key)
);

-- 3. RLS on org_data
ALTER TABLE org_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own org data"
  ON org_data FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own org data"
  ON org_data FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own org data"
  ON org_data FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete own org data"
  ON org_data FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_org_data_org_key ON org_data(organization_id, data_key);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(organization_id);

-- 5. Updated_at trigger for org_data
CREATE OR REPLACE FUNCTION update_org_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_data_updated_at
  BEFORE UPDATE ON org_data
  FOR EACH ROW EXECUTE FUNCTION update_org_data_updated_at();
