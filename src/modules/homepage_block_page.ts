// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 首页-发现 block page
// 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L259 HomeBlockPageWrap
// query.refresh 是否刷新数据
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = { refresh: query.refresh || false, cursor: query.cursor }
  return request(`/api/homepage/block/page`, data, createOption(query, 'weapi'))
}

export default async function migratedHomepageBlockPage(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
