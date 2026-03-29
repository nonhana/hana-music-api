// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成，作为 Phase 3 的兼容支撑插件。

import axios from 'axios'
import { createOption } from '../core/options.ts'
export default async (query, request) => {
  let ext = 'mp3'
  // if (query.songFile.name.indexOf('flac') > -1) {
  //   ext = 'flac'
  // }
  if (query.songFile.name.includes('.')) {
    ext = query.songFile.name.split('.').pop()
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
  try {
    const lbs = (
      await axios({
        method: 'get',
        url: `https://wanproxy.127.net/lbs?version=1.0&bucketname=${bucket}`,
      })
    ).data
    await axios({
      method: 'post',
      url: `${lbs.upload[0]}/${bucket}/${objectKey}?offset=0&complete=true&version=1.0`,
      headers: {
        'x-nos-token': tokenRes.body.result.token,
        'Content-MD5': query.songFile.md5,
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(query.songFile.size),
      },
      data: query.songFile.data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
  } catch (error) {
    console.log('error', error.response)
    throw error.response
  }
  return {
    ...tokenRes,
  }
}
