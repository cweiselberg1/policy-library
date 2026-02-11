-- ============================================================================
-- INCIDENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Add incident tracking and reporting to HIPAA compliance system
-- Created: 2026-02-12
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
CREATE TYPE incident_category AS ENUM (
  'data_breach',
  'unauthorized_access',
  'lost_device',
  'phishing',
  'malware',
  'policy_violation',
  'patient_complaint',
  'system_outage',
  'other'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Reporter info
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_name TEXT, -- For anonymous reports
  reporter_email TEXT, -- For anonymous reports
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- Incident details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category incident_category NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'open',

  -- Assignment
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  location TEXT,
  affected_systems TEXT[],
  affected_individuals_count INTEGER,

  -- Timestamps
  incident_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident comments/updates
CREATE TABLE IF NOT EXISTS incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs. visible to reporter
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident attachments (for future use)
CREATE TABLE IF NOT EXISTS incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_incidents_organization ON incidents(organization_id);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_is_anonymous ON incidents(is_anonymous);

CREATE INDEX idx_incident_comments_incident ON incident_comments(incident_id);
CREATE INDEX idx_incident_comments_user ON incident_comments(user_id);
CREATE INDEX idx_incident_comments_created ON incident_comments(created_at DESC);

CREATE INDEX idx_incident_attachments_incident ON incident_attachments(incident_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_timestamp();

CREATE TRIGGER incident_comments_updated_at
  BEFORE UPDATE ON incident_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: INCIDENTS
-- ============================================================================

-- Privacy Officers can view all incidents in their organization
CREATE POLICY "privacy_officers_view_all_incidents" ON incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
      AND profiles.role = 'privacy_officer'
    )
  );

-- Privacy Officers can insert incidents
CREATE POLICY "privacy_officers_insert_incidents" ON incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
      AND profiles.role = 'privacy_officer'
    )
  );

-- Privacy Officers can update incidents in their organization
CREATE POLICY "privacy_officers_update_incidents" ON incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
      AND profiles.role = 'privacy_officer'
    )
  );

-- Privacy Officers can delete incidents in their organization
CREATE POLICY "privacy_officers_delete_incidents" ON incidents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
      AND profiles.role = 'privacy_officer'
    )
  );

-- Employees can view incidents they reported
CREATE POLICY "employees_view_own_incidents" ON incidents
  FOR SELECT
  USING (
    reported_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
      AND profiles.role IN ('employee', 'manager')
    )
  );

-- Employees can create incidents
CREATE POLICY "employees_create_incidents" ON incidents
  FOR INSERT
  WITH CHECK (
    reported_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = incidents.organization_id
    )
  );

-- Anonymous users can create incidents (service role only)
-- This will be handled via API with service role key

-- ============================================================================
-- RLS POLICIES: INCIDENT COMMENTS
-- ============================================================================

-- Users can view comments on incidents they have access to
CREATE POLICY "users_view_incident_comments" ON incident_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_comments.incident_id
      AND (
        -- Privacy Officers can see all
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.organization_id = incidents.organization_id
          AND profiles.role = 'privacy_officer'
        )
        OR
        -- Reporters can see non-internal comments on their incidents
        (incidents.reported_by = auth.uid() AND NOT incident_comments.is_internal)
      )
    )
  );

-- Users can add comments to incidents they can view
CREATE POLICY "users_create_comments" ON incident_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_comments.incident_id
      AND (
        -- Privacy Officers can comment
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.organization_id = incidents.organization_id
          AND profiles.role = 'privacy_officer'
        )
        OR
        -- Reporters can comment on their own incidents
        incidents.reported_by = auth.uid()
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "users_update_own_comments" ON incident_comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "users_delete_own_comments" ON incident_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: INCIDENT ATTACHMENTS
-- ============================================================================

-- Users can view attachments on incidents they have access to
CREATE POLICY "users_view_attachments" ON incident_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_attachments.incident_id
      AND (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.organization_id = incidents.organization_id
          AND profiles.role = 'privacy_officer'
        )
        OR
        incidents.reported_by = auth.uid()
      )
    )
  );

-- Users can upload attachments to incidents they can access
CREATE POLICY "users_upload_attachments" ON incident_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_attachments.incident_id
      AND (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.organization_id = incidents.organization_id
          AND profiles.role = 'privacy_officer'
        )
        OR
        incidents.reported_by = auth.uid()
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get incident statistics
CREATE OR REPLACE FUNCTION get_incident_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_incidents', COUNT(*),
    'open_incidents', COUNT(*) FILTER (WHERE status = 'open'),
    'investigating', COUNT(*) FILTER (WHERE status = 'investigating'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'critical', COUNT(*) FILTER (WHERE severity = 'critical'),
    'high', COUNT(*) FILTER (WHERE severity = 'high'),
    'avg_resolution_time_hours', AVG(
      EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
    ) FILTER (WHERE resolved_at IS NOT NULL)
  )
  INTO result
  FROM incidents
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (FOR TESTING ONLY - REMOVE IN PRODUCTION)
-- ============================================================================

-- Uncomment below to add sample incidents for testing

/*
INSERT INTO incidents (
  organization_id,
  reported_by,
  title,
  description,
  category,
  severity,
  status
)
SELECT
  (SELECT id FROM organizations LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'privacy_officer' LIMIT 1),
  'Sample Incident: Unauthorized Access Attempt',
  'Multiple failed login attempts detected from unknown IP address.',
  'unauthorized_access',
  'high',
  'investigating'
WHERE EXISTS (SELECT 1 FROM organizations LIMIT 1);
*/

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON TABLE incidents IS 'HIPAA incident tracking and management';
COMMENT ON TABLE incident_comments IS 'Comments and updates on incidents';
COMMENT ON TABLE incident_attachments IS 'File attachments for incident documentation';
