import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AudioMatchQuery } from '../types/modules.ts'

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

interface AudioMatchResponseBody {
  code?: number
  data?: Record<string, unknown>
  message?: string
}

const legacyModule = async (query: AudioMatchQuery, _request: ModuleRequest) => {
  const response = await fetch(
    `https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=${
      query.duration
    }&rawdata=${encodeURIComponent(String(query.audioFP ?? ''))}&times=1&decrypt=1`,
  )
  const res = readAudioMatchResponse(await response.json())
  return {
    status: 200,
    body: {
      code: res.code ?? 200,
      data: res.data,
      message: res.message,
    },
    cookie: [],
  }
}

export default async function migratedAudioMatch(
  query: AudioMatchQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}

function readAudioMatchResponse(value: unknown): AudioMatchResponseBody {
  if (!isRecordLike(value)) {
    return {
      code: 200,
    }
  }

  const code = typeof value.code === 'number' ? value.code : 200
  const data = isRecordLike(value.data) ? value.data : undefined
  return {
    code,
    data,
    message: typeof value.message === 'string' ? value.message : undefined,
  }
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
