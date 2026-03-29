// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 首页-发现 dragon ball
// 这个接口为移动端接口，首页-发现页（每日推荐、歌单、排行榜 那些入口）
// 数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L290 HomeDragonBallWrap
// !需要登录或者游客登录，非登录返回 []
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {}

  return request(`/api/homepage/dragon/ball/static`, data, createOption(query))
}

export default async function migratedHomepageDragonBall(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
