import * as mm from 'music-metadata'
import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CloudQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import uploadPlugin from '../plugins/song-upload.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: CloudQuery, request: ModuleRequest) => {
  if (!query.songFile) {
    throw {
      status: 500,
      body: {
        msg: '请上传音乐文件',
        code: 500,
      },
      cookie: [],
    }
  }

  const songFile = query.songFile
  const songBuffer = toBuffer(songFile.data)
  let ext = 'mp3'
  if (songFile.name.includes('.')) {
    ext = songFile.name.split('.').pop() ?? ext
  }
  songFile.name = Buffer.from(songFile.name, 'latin1').toString('utf-8')
  const filename = songFile.name
    .replace('.' + ext, '')
    .replace(/\s/g, '')
    .replace(/\./g, '_')
  const bitrate = 999000
  if (!songFile.md5) {
    // 命令行上传没有md5和size信息,需要填充
    songFile.md5 = createHash('md5').update(songBuffer).digest('hex')
    songFile.size = songBuffer.byteLength
  }
  const res = await request(
    `/api/cloud/upload/check`,
    {
      bitrate: String(bitrate),
      ext: '',
      length: songFile.size,
      md5: songFile.md5,
      songId: '0',
      version: 1,
    },
    createOption(query),
  )
  let artist = ''
  let album = ''
  let songName = ''
  try {
    const metadata = await mm.parseBuffer(songBuffer, songFile.mimetype)
    const info = metadata.common

    if (info.title) {
      songName = info.title
    }
    if (info.album) {
      album = info.album
    }
    if (info.artist) {
      artist = info.artist
    }
  } catch {}
  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: '',
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: songFile.md5,
    },
    createOption(query),
  )

  if (res.body.needUpload) {
    await uploadPlugin(query, request)
  }
  const res2 = await request(
    `/api/upload/cloud/info/v2`,
    {
      md5: songFile.md5,
      songid: res.body.songId,
      filename: songFile.name,
      song: songName || filename,
      album: album || '未知专辑',
      artist: artist || '未知艺术家',
      bitrate: String(bitrate),
      resourceId: tokenRes.body.result.resourceId,
    },
    createOption(query),
  )
  const res3 = await request(
    `/api/cloud/pub/v2`,
    {
      songid: res2.body.songId,
    },
    createOption(query),
  )
  return {
    status: 200,
    body: {
      ...res.body,
      ...res3.body,
    },
    cookie: res.cookie,
  }
}

export default async function migratedCloud(
  query: CloudQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}

function toBuffer(data: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(data)) {
    return data
  }

  return data instanceof Uint8Array ? Buffer.from(data) : Buffer.from(new Uint8Array(data))
}
