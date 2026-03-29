// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 听歌打卡

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    logs: JSON.stringify([
      {
        action: 'play',
        json: {
          download: 0,
          end: 'playend',
          id: query.id,
          sourceId: query.sourceid,
          time: query.time,
          type: 'song',
          wifi: 0,
          source: 'list',
          mainsite: 1,
          content: '',
        },
      },
    ]),
  }

  return request(`/api/feedback/weblog`, data, createOption(query, 'weapi'))
}

export default async function migratedScrobble(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
