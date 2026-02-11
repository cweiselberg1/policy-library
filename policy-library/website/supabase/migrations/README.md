# Database Migrations

This directory contains SQL migration files for the Supabase database.

## Applying Migrations

### Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

## Migration Files

### 20260203_remediation_plan_tracking.sql

Adds remediation plan tracking functionality:

**Tables:**
- `remediation_plans` - Tracks remediation plans with policy dependencies
- `policy_publications` - Records when policies are published

**Features:**
- Automatic status updates when all policy dependencies are completed
- Triggers that monitor course completion and update plan status
- Row Level Security (RLS) policies for data access control
- Indexes for performance optimization

**Status Flow:**
1. `open` - Plan has incomplete policy dependencies
2. `closeable` - All dependencies met, ready to close
3. `closed` - Manually closed by user

**Automatic Updates:**
When a user completes a course (policy), the system:
1. Checks all remediation plans with that policy as a dependency
2. Evaluates if all dependencies are now complete
3. Updates status to 'closeable' if all dependencies are met
4. Records which policy triggered the update

## Schema Design

### remediation_plans
- `policy_dependencies`: Array of policy IDs that must be completed
- `regulatory_requirements`: JSONB with CFR citations
- `auto_populated_fields`: JSONB with auto-filled data from policies
- `triggered_by_policy_id`: Tracks which policy completion triggered status change

### policy_publications
- Tracks publication history with user attribution
- Links to `profiles` table via `published_by` foreign key
- Stores additional metadata in JSONB format
