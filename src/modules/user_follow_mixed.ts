// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 当前账号关注的用户/歌手

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const size = query.size || 30
  const cursor = query.cursor || 0
  const scene = query.scene || 0 // 0: 所有关注 1: 关注的歌手 2: 关注的用户
  const data = {
    authority: 'false',
    page: JSON.stringify({
      size: size,
      cursor: cursor,
    }),
    scene: scene,
    size: size,
    sortType: '0',
  }
  return request(
    `/api/user/follow/users/mixed/get/v2`,
    data,
    createOption(query),
  )
}

export default async function migratedUserFollowMixed(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
