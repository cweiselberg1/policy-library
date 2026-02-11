import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { DepartmentInsert, DepartmentUpdate, DepartmentNode } from '@/types/employee-management'

/**
 * GET /api/departments?organization_id={id}&hierarchy=true
 * List departments for an organization, optionally with hierarchy
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('organization_id')
    const hierarchy = url.searchParams.get('hierarchy') === 'true'

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Fetch departments (RLS will filter based on user permissions)
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name') as any

    if (error) {
      console.error('Error fetching departments:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // If hierarchy requested, build tree structure
    if (hierarchy && departments) {
      const tree = buildDepartmentTree(departments)
      return NextResponse.json({ data: tree })
    }

    return NextResponse.json({ data: departments })
  } catch (error) {
    console.error('Error in GET /api/departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/departments
 * Create a new department
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.organization_id || !body.name) {
      return NextResponse.json(
        { error: 'Invalid request body. organization_id and name are required' },
        { status: 400 }
      )
    }

    // If parent_id is provided, verify it exists and doesn't create a cycle
    if (body.parent_id) {
      const { data: parentDept, error: parentError } = await supabase
      .from('departments')
        .select('id, parent_id')
        .eq('id', body.parent_id)
        .single() as any

      if (parentError || !parentDept) {
        return NextResponse.json(
          { error: 'Parent department not found' },
          { status: 400 }
        )
      }
    }

    // Prepare department data
    const departmentData: DepartmentInsert = {
      organization_id: body.organization_id,
      name: body.name.trim(),
      description: body.description || null,
      parent_id: body.parent_id || null,
      manager_id: body.manager_id || null,
      budget: body.budget || null,
      status: body.status || 'active',
      metadata: body.metadata || null
    }

    // Create department
    const { data: department, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating department:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/departments?id={id}
 * Update an existing department
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get department ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // If changing parent, verify it doesn't create a cycle
    if (body.parent_id) {
      const wouldCreateCycle = await checkDepartmentCycle(supabase, id, body.parent_id)
      if (wouldCreateCycle) {
        return NextResponse.json(
          { error: 'Cannot set parent department: would create a circular hierarchy' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: DepartmentUpdate = {
      updated_at: new Date().toISOString()
    }

    // Only include fields that are provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id
    if (body.manager_id !== undefined) updateData.manager_id = body.manager_id
    if (body.budget !== undefined) updateData.budget = body.budget
    if (body.status !== undefined) updateData.status = body.status
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    // Update department (RLS will check permissions)
    const { data: department, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating department:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error in PATCH /api/departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/departments?id={id}
 * Delete a department (soft delete by setting status to 'inactive')
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get department ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    // Check if department has child departments
    const { data: children, error: childError } = await supabase
      .from('departments')
      .select('id')
      .eq('parent_id', id)
      .limit(1)

    if (childError) {
      console.error('Error checking child departments:', childError)
      return NextResponse.json(
        { error: childError.message },
        { status: 500 }
      )
    }

    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with child departments. Please reassign or delete child departments first.' },
        { status: 400 }
      )
    }

    // Soft delete by setting status to 'inactive'
    const { data: department, error } = await supabase
      .from('departments')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting department:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to build department tree hierarchy
 */
function buildDepartmentTree(departments: any[]): DepartmentNode[] {
  const departmentMap = new Map<string, DepartmentNode>()
  const rootDepartments: DepartmentNode[] = []

  // First pass: create all nodes
  departments.forEach(dept => {
    departmentMap.set(dept.id, { ...dept, children: [], depth: 0 })
  })

  // Second pass: build tree structure
  departments.forEach(dept => {
    const node = departmentMap.get(dept.id)!
    if (dept.parent_id) {
      const parent = departmentMap.get(dept.parent_id)
      if (parent) {
        node.depth = (parent.depth || 0) + 1
        parent.children!.push(node)
      } else {
        // Parent not found, treat as root
        rootDepartments.push(node)
      }
    } else {
      rootDepartments.push(node)
    }
  })

  return rootDepartments
}

/**
 * Helper function to check if setting a parent would create a cycle
 */
async function checkDepartmentCycle(
  supabase: any,
  departmentId: string,
  proposedParentId: string
): Promise<boolean> {
  if (departmentId === proposedParentId) {
    return true // Direct self-reference
  }

  // Fetch all departments to check for cycles
  const { data: departments } = await supabase
      .from('departments')
    .select('id, parent_id')

  if (!departments) return false

  const departmentMap = new Map<string, string | null>(
    departments.map((d: any) => [d.id, d.parent_id])
  )

  // Walk up the tree from proposed parent to see if we encounter current department
  let currentId: string | null = proposedParentId
  const visited = new Set<string>()

  while (currentId) {
    if (currentId === departmentId) {
      return true // Cycle detected
    }
    if (visited.has(currentId)) {
      return false // Already visited, no cycle
    }
    visited.add(currentId)
    currentId = departmentMap.get(currentId) || null
  }

  return false
}
