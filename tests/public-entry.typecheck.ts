import type {
  ModuleContractMap,
  ModuleIdentifier,
  ModuleQueryOf,
  ModuleResponseOf,
  NcmApiResponse,
  ProgrammaticApi,
} from '../index.ts'

import { createModuleApi, invokeModule, NeteaseCloudMusicApi } from '../index.ts'

async function assertPublicEntrySurface() {
  const api = createModuleApi()
  const typedApi: ProgrammaticApi = api
  const topSongIdentifier: ModuleIdentifier = 'top_song'
  const fallbackQuery: ModuleQueryOf<'top_song'> = {
    type: 96,
  }
  const fallbackContract: ModuleContractMap['top_song'] = {
    query: fallbackQuery,
    response: {
      body: {},
      cookie: [],
      status: 200,
    },
  }

  await api.top_song(fallbackQuery)
  await typedApi[topSongIdentifier](fallbackContract.query)

  await NeteaseCloudMusicApi.top_song({
    type: 7,
  })

  const fallbackResponse: ModuleResponseOf<'top_song'> = await invokeModule('top_song', {
    type: 16,
  })
  const conservativeResponse: NcmApiResponse = fallbackResponse
  void conservativeResponse

  // @ts-expect-error unknown module identifier must not compile
  await invokeModule('not_a_real_module', {})

  // @ts-expect-error unknown API property must not compile
  await api.not_a_real_module({})
}

void assertPublicEntrySurface
