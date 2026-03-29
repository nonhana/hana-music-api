// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { eapiResDecrypt, eapiReqDecrypt } from '../core/crypto.ts'
import { createOption } from '../core/options.ts'

const legacyModule = async (query, request) => {
  const hexString = query.hexString.replace(/\s/g, '')
  const isReq = query.isReq !== 'false'

  if (!hexString) {
    return {
      status: 400,
      body: {
        code: 400,
        message: 'hex string is required',
      },
    }
  }

  let data
  if (isReq) {
    data = eapiReqDecrypt(hexString)
  } else {
    data = eapiResDecrypt(hexString) || eapiResDecrypt(hexString, true)
  }

  return {
    status: 200,
    body: {
      code: 200,
      data: data,
    },
  }
}

export default async function migratedEapiDecrypt(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
