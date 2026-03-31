import { RESOURCE_TYPE_MAP } from '../core/config.ts'

const RESOURCE_TYPE_LOOKUP: Record<string, string> = RESOURCE_TYPE_MAP
const DJ_TOPLIST_TYPE_LOOKUP: Record<string, 0 | 1> = {
  hot: 1,
  new: 0,
}

export function resolveResourceType(value: unknown): string {
  const key = String(Number(value ?? 0))

  return RESOURCE_TYPE_LOOKUP[key] ?? RESOURCE_TYPE_LOOKUP['0'] ?? ''
}

export function resolveDjToplistType(value: unknown): 0 | 1 {
  const key = value === 'hot' ? 'hot' : 'new'

  return DJ_TOPLIST_TYPE_LOOKUP[key] ?? 0
}
