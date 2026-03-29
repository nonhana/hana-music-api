// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import uploadPlugin from '../plugins/upload.ts'
import { createOption } from '../core/options.ts'
const legacyModule = async (query, request) => {
  if (!query.imgFile) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: 'imgFile is required',
      },
    }
  }
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/playlist/cover/update`,
    {
      id: query.id,
      coverImgId: uploadInfo.imgId,
    },
    createOption(query, 'weapi'),
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}

export default async function migratedPlaylistCoverUpdate(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
