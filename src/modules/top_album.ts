// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 新碟上架

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const date = new Date()

  const data = {
    area: query.area || 'ALL', // //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    limit: query.limit || 50,
    offset: query.offset || 0,
    type: query.type || 'new',
    year: query.year || date.getFullYear(),
    month: query.month || date.getMonth() + 1,
    total: false,
    rcmd: true,
  }
  return request(
    `/api/discovery/new/albums/area`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedTopAlbum(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
