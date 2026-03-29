// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌曲链接 - v1
// 此版本不再采用 br 作为音质区分的标准
// 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    ids: '[' + query.id + ']',
    level: query.level,
    encodeType: 'flac',
  }
  if (data.level == 'sky') {
    data.immerseType = 'c51'
  }
  return request(`/api/song/enhance/player/url/v1`, data, createOption(query))
}

export default async function migratedSongUrlV1(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
