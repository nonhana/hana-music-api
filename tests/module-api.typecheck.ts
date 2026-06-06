import { createModuleApi, invokeModule, NeteaseCloudMusicApi } from '../src/app/module-api.ts'

async function assertPromotedModuleTypes() {
  const api = createModuleApi()

  await api.search({
    keywords: '周杰伦',
    type: 1,
  })

  await api.comment_music({
    id: 12345,
    limit: 20,
  })

  await api.song_url({
    br: 320000,
    id: '1,2',
  })

  await api.login_cellphone({
    captcha: '1234',
    phone: '13800138000',
  })

  await invokeModule('voice_upload', {
    songFile: {
      data: new Uint8Array([1, 2, 3]),
      mimetype: 'audio/mpeg',
      name: 'demo.mp3',
      size: 3,
    },
  })

  await NeteaseCloudMusicApi.search({
    keywords: 'fallback-safe',
  })

  // @ts-expect-error search requires keywords
  await api.search({})

  // @ts-expect-error login_cellphone requires phone
  await api.login_cellphone({
    captcha: '1234',
  })
}

void assertPromotedModuleTypes
