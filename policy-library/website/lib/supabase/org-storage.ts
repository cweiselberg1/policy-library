import { createClient } from './client'

// In-memory cache (replaces localStorage for hipaa-*/ogc-* keys)
let cache: Record<string, string> = {}
let currentOrgId: string | null = null
let saveQueue: Promise<void> = Promise.resolve()

export const orgStorage = {
  getItem(key: string): string | null {
    return cache[key] ?? null
  },

  setItem(key: string, value: string): void {
    cache[key] = value
    if (currentOrgId) {
      queueSave(currentOrgId, key, value)
    }
  },

  removeItem(key: string): void {
    delete cache[key]
    if (currentOrgId) {
      queueRemove(currentOrgId, key)
    }
  },

  clear(): void {
    cache = {}
    currentOrgId = null
  },
}

export async function loadOrgData(orgId: string): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('org_data')
    .select('data_key, data_value')
    .eq('organization_id', orgId)

  if (error) {
    console.error('Failed to load org data:', error)
    return
  }

  cache = {}
  currentOrgId = orgId
  for (const row of data ?? []) {
    if (row.data_value !== null) {
      cache[row.data_key] = JSON.stringify(row.data_value)
    }
  }
}

function queueSave(orgId: string, key: string, value: string): void {
  saveQueue = saveQueue.then(() => saveToSupabase(orgId, key, value)).catch(() => {})
}

function queueRemove(orgId: string, key: string): void {
  saveQueue = saveQueue.then(() => removeFromSupabase(orgId, key)).catch(() => {})
}

async function saveToSupabase(orgId: string, key: string, value: string): Promise<void> {
  const supabase = createClient()
  try {
    const parsed = JSON.parse(value)
    await supabase.from('org_data').upsert(
      { organization_id: orgId, data_key: key, data_value: parsed },
      { onConflict: 'organization_id,data_key' }
    )
  } catch (e) {
    console.error('Failed to save org data:', key, e)
  }
}

async function removeFromSupabase(orgId: string, key: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('org_data')
    .delete()
    .eq('organization_id', orgId)
    .eq('data_key', key)
}

export function getOrgId(): string | null {
  return currentOrgId
}
