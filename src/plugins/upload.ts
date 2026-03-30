import type { ModuleRequest } from '../types/index.ts'
import type { UploadImageQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'

export default async function uploadPlugin(query: UploadImageQuery, request: ModuleRequest) {
  if (!query.imgFile) {
    throw new TypeError('imgFile is required for upload plugin')
  }
  const imageBuffer = toBuffer(query.imgFile.data)

  const data = {
    bucket: 'yyimgs',
    ext: 'jpg',
    filename: query.imgFile.name,
    local: false,
    nos_product: 0,
    return_body: `{"code":200,"size":"$(ObjectSize)"}`,
    type: 'other',
  }
  //   获取key和token
  const res = await request(`/api/nos/token/alloc`, data, createOption(query, 'weapi'))
  await fetch(
    `https://nosup-hz1.127.net/yyimgs/${String(res.body.result.objectKey)}?offset=0&complete=true&version=1.0`,
    {
      method: 'POST',
      headers: {
        'x-nos-token': String(res.body.result.token),
        'Content-Type': 'image/jpeg',
      },
      body: imageBuffer,
    },
  )

  return {
    url_pre: 'https://p1.music.126.net/' + String(res.body.result.objectKey),
    imgId: res.body.result.docId,
  }
}

function toBuffer(data: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(data)) {
    return data
  }

  return data instanceof Uint8Array ? Buffer.from(data) : Buffer.from(new Uint8Array(data))
}
