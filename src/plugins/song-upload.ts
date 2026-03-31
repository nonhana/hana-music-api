import type { ModuleRequest } from '../types/index.ts'
import type { UploadSongQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'

interface LbsResponse {
  upload?: string[]
}

export default async function uploadSongPlugin(query: UploadSongQuery, request: ModuleRequest) {
  if (!query.songFile) {
    throw new TypeError('songFile is required for song upload plugin')
  }
  const songBuffer = toBuffer(query.songFile.data)

  let ext = 'mp3'
  if (query.songFile.name.includes('.')) {
    ext = query.songFile.name.split('.').pop() ?? ext
  }
  const filename = query.songFile.name
    .replace('.' + ext, '')
    .replace(/\s/g, '')
    .replace(/\./g, '_')
  const bucket = 'jd-musicrep-privatecloud-audio-public'
  //   获取key和token
  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: bucket,
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 3,
      type: 'audio',
      md5: query.songFile.md5,
    },
    createOption(query, 'weapi'),
  )

  // 上传
  const objectKey = tokenRes.body.result.objectKey.replace('/', '%2F')
  const lbs = readLbsResponse(
    await (await fetch(`https://wanproxy.127.net/lbs?version=1.0&bucketname=${bucket}`)).json(),
  )
  const uploadBase = lbs.upload?.[0]
  if (!uploadBase) {
    throw new TypeError('NOS LBS upload endpoint is missing')
  }

  const response = await fetch(
    `${uploadBase}/${bucket}/${objectKey}?offset=0&complete=true&version=1.0`,
    {
      method: 'POST',
      headers: {
        'x-nos-token': String(tokenRes.body.result.token),
        'Content-MD5': String(query.songFile.md5 ?? ''),
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(query.songFile.size),
      },
      body: songBuffer,
    },
  )
  if (!response.ok) {
    throw new Error(`song upload failed with status ${response.status}`)
  }
  return {
    ...tokenRes,
  }
}

function toBuffer(data: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(data)) {
    return data
  }

  return data instanceof Uint8Array ? Buffer.from(data) : Buffer.from(new Uint8Array(data))
}

function readLbsResponse(value: unknown): LbsResponse {
  if (!isRecordLike(value) || !Array.isArray(value.upload)) {
    return {}
  }

  return {
    upload: value.upload.map((entry) => String(entry)),
  }
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
