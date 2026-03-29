// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 私人 DJ

// 实际请求参数如下, 部分内容省略, 敏感信息已进行混淆
// 可按需修改此 API 的代码
/* {"extInfo":"{\"lastRequestTimestamp\":1692358373509,\"lbsInfoList\":[{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692358543},{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692055283}],\"listenedTs\":false,\"noAidjToAidj\":true}","header":"{}"} */

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  var extInfo = {}
  if (query.latitude != undefined) {
    extInfo.lbsInfoList = [
      {
        lat: query.latitude,
        lon: query.longitude,
        time: Date.parse(new Date()) / 1000,
      },
    ]
  }
  extInfo.noAidjToAidj = false
  extInfo.lastRequestTimestamp = new Date().getTime()
  extInfo.listenedTs = false
  const data = {
    extInfo: JSON.stringify(extInfo),
  }
  // console.log(data)
  return request(`/api/aidj/content/rcmd/info`, data, createOption(query))
}

export default async function migratedAidjContentRcmd(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
