-- Create enum for remediation plan status
CREATE TYPE remediation_status AS ENUM ('open', 'closeable', 'closed');

-- Create remediation_plans table
CREATE TABLE IF NOT EXISTS remediation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  policy_dependencies TEXT[] NOT NULL DEFAULT '{}',
  status remediation_status NOT NULL DEFAULT 'open',
  regulatory_requirements JSONB DEFAULT '{}',
  auto_populated_fields JSONB DEFAULT '{}',
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_by_policy_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_publications table
CREATE TABLE IF NOT EXISTS policy_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_remediation_plans_status ON remediation_plans(status);
CREATE INDEX idx_remediation_plans_policy_deps ON remediation_plans USING GIN(policy_dependencies);
CREATE INDEX idx_policy_publications_policy_id ON policy_publications(policy_id);
CREATE INDEX idx_policy_publications_published_by ON policy_publications(published_by);

-- Function to check if all policy dependencies are met
CREATE OR REPLACE FUNCTION check_remediation_plan_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  plan RECORD;
  all_policies_complete BOOLEAN;
  policy_id TEXT;
BEGIN
  -- Loop through all remediation plans
  FOR plan IN SELECT * FROM remediation_plans WHERE status = 'open' LOOP
    all_policies_complete := TRUE;

    -- Check if all policy dependencies are completed
    FOREACH policy_id IN ARRAY plan.policy_dependencies LOOP
      -- Check if the policy is completed by checking course_progress
      IF NOT EXISTS (
        SELECT 1
        FROM course_progress
        WHERE course_id = policy_id
        AND completed_at IS NOT NULL
        AND user_id = NEW.user_id
      ) THEN
        all_policies_complete := FALSE;
        EXIT;
      END IF;
    END LOOP;

    -- Update status to 'closeable' if all dependencies are met
    IF all_policies_complete THEN
      UPDATE remediation_plans
      SET
        status = 'closeable',
        last_updated_at = NOW(),
        triggered_by_policy_id = NEW.course_id::UUID
      WHERE id = plan.id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check remediation plans when course progress is updated
CREATE TRIGGER check_remediation_plans_on_course_completion
AFTER UPDATE OF completed_at ON course_progress
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
EXECUTE FUNCTION check_remediation_plan_dependencies();

-- Function to update last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_remediation_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_updated_at
CREATE TRIGGER update_remediation_plan_timestamp_trigger
BEFORE UPDATE ON remediation_plans
FOR EACH ROW
EXECUTE FUNCTION update_remediation_plan_timestamp();

-- Enable Row Level Security
ALTER TABLE remediation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_publications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for remediation_plans
CREATE POLICY "Users can view all remediation plans"
  ON remediation_plans FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert remediation plans"
  ON remediation_plans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update remediation plans"
  ON remediation_plans FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policies for policy_publications
CREATE POLICY "Users can view all policy publications"
  ON policy_publications FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert policy publications"
  ON policy_publications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE remediation_plans IS 'Tracks remediation plans with policy dependencies and regulatory requirements';
COMMENT ON TABLE policy_publications IS 'Tracks when policies are published and by whom';
COMMENT ON COLUMN remediation_plans.policy_dependencies IS 'Array of policy IDs that must be completed before plan can be closed';
COMMENT ON COLUMN remediation_plans.status IS 'Current status: open (has incomplete dependencies), closeable (all dependencies met), closed (manually closed)';
COMMENT ON COLUMN remediation_plans.regulatory_requirements IS 'JSONB object containing CFR citations and specific requirements';
COMMENT ON COLUMN remediation_plans.auto_populated_fields IS 'JSONB object containing fields automatically filled from policy content';
COMMENT ON COLUMN remediation_plans.triggered_by_policy_id IS 'UUID of the policy that triggered the most recent status update';
