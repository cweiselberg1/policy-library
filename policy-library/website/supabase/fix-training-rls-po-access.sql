-- Add Privacy Officer read access to training tables
-- So POs can see all employees' training progress

CREATE POLICY "Privacy officers can view all training progress"
  ON public.training_progress
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR get_user_role() IN ('admin', 'privacy_officer')
  );

CREATE POLICY "Privacy officers can view all module completions"
  ON public.module_completions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR get_user_role() IN ('admin', 'privacy_officer')
  );

CREATE POLICY "Privacy officers can view all policy acknowledgments"
  ON public.policy_acknowledgments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR get_user_role() IN ('admin', 'privacy_officer')
  );

-- Drop the old user-only SELECT policies (replaced by the ones above which include PO access)
DROP POLICY IF EXISTS "Users can view their own training progress" ON public.training_progress;
DROP POLICY IF EXISTS "Users can view their own module completions" ON public.module_completions;
DROP POLICY IF EXISTS "Users can view their own policy acknowledgments" ON public.policy_acknowledgments;
