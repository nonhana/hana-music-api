// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 排行榜
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  if (query.idx) {
    return Promise.resolve({
      status: 500,
      body: {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      },
    })
  }

  const data = {
    id: query.id,
    n: '500',
    s: '0',
  }
  return request(`/api/playlist/v4/detail`, data, createOption(query))
}

export default async function migratedTopList(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
