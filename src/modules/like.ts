// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 红心与取消红心歌曲

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.like = query.like == 'false' ? false : true
  const data = {
    alg: 'itembased',
    trackId: query.id,
    like: query.like,
    time: '3',
  }
  return request(`/api/radio/like`, data, createOption(query, 'weapi'))
}

export default async function migratedLike(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
