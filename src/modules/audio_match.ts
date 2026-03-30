import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LegacyModuleQuery, _request: ModuleRequest) => {
  const response = await fetch(
    `https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=${
      query.duration
    }&rawdata=${encodeURIComponent(String(query.audioFP ?? ''))}&times=1&decrypt=1`,
  )
  const res = (await response.json()) as { data?: { data?: unknown } }
  return {
    status: 200,
    body: {
      code: 200,
      data: res.data?.data,
    },
    cookie: [],
  }
}

export default async function migratedAudioMatch(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
