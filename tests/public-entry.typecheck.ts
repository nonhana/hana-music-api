import type {
  CreateHanaMusicApiConfig,
  HanaMusicApiClient,
  ModuleIdentifier,
  ModuleCallConfig,
  ModuleQueryOf,
  ModuleResponseOf,
  NcmApiResponse,
  RequestCrypto,
} from '../index.ts'

import { createHanaMusicApi, invokeModule, search, songUrl } from '../index.ts'

async function assertPublicEntrySurface() {
  const config: CreateHanaMusicApiConfig = {
    cookie: 'MUSIC_U=demo-cookie',
  }
  const api: HanaMusicApiClient = createHanaMusicApi(config)
  const topSongIdentifier: ModuleIdentifier = 'top_song'
  const fallbackQuery: ModuleQueryOf<'top_song'> = {
    type: 96,
  }
  const moduleCallConfig: ModuleCallConfig = {
    crypto: 'weapi' satisfies RequestCrypto,
  }

  await api.topSong(fallbackQuery)
  await search({
    keywords: '周杰伦',
  })
  await songUrl({
    id: '1,2',
  })

  const fallbackResponse: ModuleResponseOf<'top_song'> = await invokeModule(
    topSongIdentifier,
    {
      type: 16,
    },
    moduleCallConfig,
  )
  const conservativeResponse: NcmApiResponse = fallbackResponse
  void conservativeResponse

  // @ts-expect-error unknown module identifier must not compile
  await invokeModule('not_a_real_module', {}, moduleCallConfig)

  // @ts-expect-error unknown API property must not compile
  await api.notARealModule({})
}

void assertPublicEntrySurface
