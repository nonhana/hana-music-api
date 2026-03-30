import { randomUUID } from 'node:crypto'
import * as xml2js from 'xml2js'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const parser = new xml2js.Parser()

function createDupkey(): string {
  return randomUUID()
}

function isEnabledFlag(value: unknown): boolean {
  return Number(value) === 1
}

const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  if (!query.songFile) {
    throw {
      status: 500,
      body: {
        msg: '请上传音频文件',
        code: 500,
      },
    }
  }

  let ext = 'mp3'
  if (query.songFile.name.includes('flac')) {
    ext = 'flac'
  }
  const filename =
    query.songName ||
    query.songFile.name
      .replace('.' + ext, '')
      .replace(/\s/g, '')
      .replace(/\./g, '_')

  const tokenRes = await request(
    `/api/nos/token/alloc`,
    {
      bucket: 'ymusic',
      ext: ext,
      filename: filename,
      local: false,
      nos_product: 0,
      type: 'other',
    },
    createOption(query, 'weapi'),
  )

  const objectKey = tokenRes.body.result.objectKey.replace('/', '%2F')
  const docId = tokenRes.body.result.docId
  const initResponse = await fetch(`https://ymusic.nos-hz.163yun.com/${objectKey}?uploads`, {
    method: 'POST',
    headers: {
      'x-nos-token': tokenRes.body.result.token,
      'X-Nos-Meta-Content-Type': 'audio/mpeg',
    },
  })
  const res2 = await parser.parseStringPromise(await initResponse.text())

  const fileSize = query.songFile.data.length
  const blockSize = 10 * 1024 * 1024 // 10MB
  let offset = 0
  let blockIndex = 1

  const etags = []

  while (offset < fileSize) {
    const chunk = query.songFile.data.slice(offset, Math.min(offset + blockSize, fileSize))

    const partResponse = await fetch(
      `https://ymusic.nos-hz.163yun.com/${objectKey}?partNumber=${blockIndex}&uploadId=${res2.InitiateMultipartUploadResult.UploadId[0]}`,
      {
        method: 'PUT',
        headers: {
          'x-nos-token': tokenRes.body.result.token,
          'Content-Type': 'audio/mpeg',
        },
        body: chunk,
      },
    )
    const etag = partResponse.headers.get('etag') ?? ''
    etags.push(etag)
    offset += blockSize
    blockIndex++
  }

  let completeStr = '<CompleteMultipartUpload>'
  for (let i = 0; i < etags.length; i++) {
    completeStr += `<Part><PartNumber>${i + 1}</PartNumber><ETag>${etags[i]}</ETag></Part>`
  }
  completeStr += '</CompleteMultipartUpload>'

  // 文件处理
  await fetch(
    `https://ymusic.nos-hz.163yun.com/${objectKey}?uploadId=${res2.InitiateMultipartUploadResult.UploadId[0]}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'X-Nos-Meta-Content-Type': 'audio/mpeg',
        'x-nos-token': tokenRes.body.result.token,
      },
      body: completeStr,
    },
  )

  // preCheck
  await request(
    `/api/voice/workbench/voice/batch/upload/preCheck`,
    {
      dupkey: createDupkey(),
      voiceData: JSON.stringify([
        {
          name: filename,
          autoPublish: isEnabledFlag(query.autoPublish),
          autoPublishText: query.autoPublishText || '',
          description: query.description,
          voiceListId: query.voiceListId,
          coverImgId: query.coverImgId,
          dfsId: docId,
          categoryId: query.categoryId,
          secondCategoryId: query.secondCategoryId,
          composedSongs: query.composedSongs ? query.composedSongs.split(',') : [],
          privacy: isEnabledFlag(query.privacy),
          publishTime: query.publishTime || 0,
          orderNo: query.orderNo || 1,
        },
      ]),
    },
    {
      ...createOption(query),
      headers: {
        'x-nos-token': tokenRes.body.result.token,
      },
    },
  )
  const result = await request(
    `/api/voice/workbench/voice/batch/upload/v2`,
    {
      dupkey: createDupkey(),
      voiceData: JSON.stringify([
        {
          name: filename,
          autoPublish: isEnabledFlag(query.autoPublish),
          autoPublishText: query.autoPublishText || '',
          description: query.description,
          voiceListId: query.voiceListId,
          coverImgId: query.coverImgId,
          dfsId: docId,
          categoryId: query.categoryId,
          secondCategoryId: query.secondCategoryId,
          composedSongs: query.composedSongs ? query.composedSongs.split(',') : [],
          privacy: isEnabledFlag(query.privacy),
          publishTime: query.publishTime || 0,
          orderNo: query.orderNo || 1,
        },
      ]),
    },
    {
      ...createOption(query),
      headers: {
        'x-nos-token': tokenRes.body.result.token,
      },
    },
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: result.body.data,
    },
  }
}

export default async function migratedVoiceUpload(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
