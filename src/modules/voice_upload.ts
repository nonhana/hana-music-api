import { randomUUID } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { VoiceUploadQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { createMultipartCompleteXml, parseMultipartUploadId } from './_voice-upload-xml.ts'

interface TokenAllocationBody {
  result: {
    docId: string
    objectKey: string
    token: string
  }
}

interface VoiceUploadBody {
  data?: unknown
}

function createDupkey(): string {
  return randomUUID()
}

function isEnabledFlag(value: unknown): boolean {
  return Number(value) === 1
}

const legacyModule = async (query: VoiceUploadQuery, request: ModuleRequest) => {
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

  const tokenRes = await request<TokenAllocationBody>(
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
  const uploadId = parseMultipartUploadId(await initResponse.text())

  const fileSize = getBinarySize(query.songFile.data)
  const blockSize = 10 * 1024 * 1024 // 10MB
  let offset = 0
  let blockIndex = 1

  const etags: string[] = []

  while (offset < fileSize) {
    const chunk = sliceBinaryChunk(
      query.songFile.data,
      offset,
      Math.min(offset + blockSize, fileSize),
    )

    const partResponse = await fetch(
      `https://ymusic.nos-hz.163yun.com/${objectKey}?partNumber=${blockIndex}&uploadId=${uploadId}`,
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

  // 文件处理
  await fetch(`https://ymusic.nos-hz.163yun.com/${objectKey}?uploadId=${uploadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      'X-Nos-Meta-Content-Type': 'audio/mpeg',
      'x-nos-token': tokenRes.body.result.token,
    },
    body: createMultipartCompleteXml(etags),
  })

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
  const result = await request<VoiceUploadBody>(
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
  query: VoiceUploadQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}

function getBinarySize(data: ArrayBuffer | Buffer | Uint8Array): number {
  if (data instanceof ArrayBuffer) {
    return data.byteLength
  }

  return data.length
}

function sliceBinaryChunk(
  data: ArrayBuffer | Buffer | Uint8Array,
  start: number,
  end: number,
): ArrayBuffer | Buffer | Uint8Array {
  if (data instanceof ArrayBuffer) {
    return data.slice(start, end)
  }

  return data.slice(start, end)
}
