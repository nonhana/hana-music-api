// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 关注TA的人(粉丝)

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    userId: query.uid,
    time: '0',
    limit: query.limit || 30,
    offset: query.offset || 0,
    getcounts: 'true',
  }
  return request(
    `/api/user/getfolloweds/${query.uid}`,
    data,
    createOption(query),
  )
}

export default async function migratedUserFolloweds(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
