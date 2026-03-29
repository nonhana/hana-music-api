// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌曲相关视频

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    id: query.mvid || 0,
    type: 2,
    rcmdType: 20,
    limit: query.limit || 10,
    extInfo: JSON.stringify({ songId: query.songid }),
  }
  return request(`/api/mlog/rcmd/feed/list`, data, createOption(query))
}

export default async function migratedMlogMusicRcmd(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
