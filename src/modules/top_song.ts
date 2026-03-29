// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 新歌速递

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    areaId: query.type || 0, // 全部:0 华语:7 欧美:96 日本:8 韩国:16
    // limit: query.limit || 100,
    // offset: query.offset || 0,
    total: true,
  }
  return request(
    `/api/v1/discovery/new/songs`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedTopSong(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
