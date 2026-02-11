-- Migration: Policy Publication Event System
-- Description: Creates tables and triggers for automatic remediation plan updates
-- Date: 2026-02-03

-- ============================================================================
-- 1. REMEDIATION PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS remediation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfr_citation TEXT NOT NULL,
  title TEXT NOT NULL,
  gap_description TEXT NOT NULL,
  policy_dependencies TEXT[] DEFAULT '{}',
  regulatory_requirements JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'closeable', 'closed')) DEFAULT 'pending',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  auto_populated_fields JSONB DEFAULT NULL,
  last_auto_update TIMESTAMPTZ DEFAULT NULL,
  estimated_completion_date TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on CFR citation for lookups
CREATE INDEX IF NOT EXISTS idx_remediation_plans_cfr_citation
  ON remediation_plans(cfr_citation);

-- Create index on policy_dependencies for array containment queries
CREATE INDEX IF NOT EXISTS idx_remediation_plans_policy_dependencies
  ON remediation_plans USING GIN(policy_dependencies);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_remediation_plans_status
  ON remediation_plans(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_remediation_plans_updated_at
  BEFORE UPDATE ON remediation_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. POLICY PUBLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT NOT NULL,
  published_by UUID NOT NULL REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  policy_metadata JSONB DEFAULT '{}'
);

-- Create index on policy_id for lookups
CREATE INDEX IF NOT EXISTS idx_policy_publications_policy_id
  ON policy_publications(policy_id);

-- Create index on published_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_policy_publications_published_at
  ON policy_publications(published_at DESC);

-- ============================================================================
-- 3. AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on event_type for filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type
  ON audit_log(event_type);

-- Create index on user_id for user activity queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON audit_log(user_id);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON audit_log(created_at DESC);

-- Create GIN index on details JSONB for flexible querying
CREATE INDEX IF NOT EXISTS idx_audit_log_details
  ON audit_log USING GIN(details);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE remediation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Remediation Plans Policies
CREATE POLICY "Users can view all remediation plans"
  ON remediation_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert remediation plans"
  ON remediation_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update remediation plans"
  ON remediation_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy Publications Policies
CREATE POLICY "Users can view all policy publications"
  ON policy_publications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create policy publications"
  ON policy_publications FOR INSERT
  TO authenticated
  WITH CHECK (published_by = auth.uid());

-- Audit Log Policies
CREATE POLICY "Users can view all audit logs"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if all policy dependencies are satisfied
CREATE OR REPLACE FUNCTION check_policy_dependencies_satisfied(
  dependency_policy_ids TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  published_count INT;
BEGIN
  IF dependency_policy_ids IS NULL OR array_length(dependency_policy_ids, 1) IS NULL THEN
    RETURN true;
  END IF;

  SELECT COUNT(DISTINCT policy_id)
  INTO published_count
  FROM policy_publications
  WHERE policy_id = ANY(dependency_policy_ids);

  RETURN published_count = array_length(dependency_policy_ids, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get remediation plan statistics
CREATE OR REPLACE FUNCTION get_remediation_plan_stats()
RETURNS TABLE(
  total_plans BIGINT,
  pending_plans BIGINT,
  in_progress_plans BIGINT,
  closeable_plans BIGINT,
  closed_plans BIGINT,
  high_priority_plans BIGINT,
  critical_priority_plans BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_plans,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_plans,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_plans,
    COUNT(*) FILTER (WHERE status = 'closeable')::BIGINT as closeable_plans,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_plans,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT as high_priority_plans,
    COUNT(*) FILTER (WHERE priority = 'critical')::BIGINT as critical_priority_plans
  FROM remediation_plans;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE remediation_plans IS 'Tracks HIPAA compliance remediation plans with policy dependencies';
COMMENT ON COLUMN remediation_plans.cfr_citation IS 'CFR regulation citation (e.g., § 164.308(a)(1)(i))';
COMMENT ON COLUMN remediation_plans.policy_dependencies IS 'Array of policy IDs that must be completed';
COMMENT ON COLUMN remediation_plans.regulatory_requirements IS 'JSONB containing detailed regulatory requirements';
COMMENT ON COLUMN remediation_plans.auto_populated_fields IS 'Fields automatically populated from policy content';
COMMENT ON COLUMN remediation_plans.last_auto_update IS 'Timestamp of last automatic update';

COMMENT ON TABLE policy_publications IS 'Records when policies are published/completed';
COMMENT ON COLUMN policy_publications.policy_metadata IS 'Snapshot of policy metadata at publication time';

COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for all system events';
COMMENT ON COLUMN audit_log.details IS 'Flexible JSONB field for event-specific details';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Insert initial audit log entry
INSERT INTO audit_log (event_type, details)
VALUES (
  'migration_completed',
  jsonb_build_object(
    'migration_name', '20260203_policy_publication_system',
    'description', 'Created tables for policy publication event system with automatic remediation plan updates'
  )
);
