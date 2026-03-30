import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 私人 DJ
// 实际请求参数如下, 部分内容省略, 敏感信息已进行混淆
// 可按需修改此 API 的代码
/* {"extInfo":"{\"lastRequestTimestamp\":1692358373509,\"lbsInfoList\":[{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692358543},{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692055283}],\"listenedTs\":false,\"noAidjToAidj\":true}","header":"{}"} */
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const extInfo: Record<string, unknown> = {}
  if (query.latitude != undefined) {
    extInfo.lbsInfoList = [
      {
        lat: query.latitude,
        lon: query.longitude,
        time: Math.floor(Date.now() / 1000),
      },
    ]
  }
  extInfo.noAidjToAidj = false
  extInfo.lastRequestTimestamp = Date.now()
  extInfo.listenedTs = false
  const data = {
    extInfo: JSON.stringify(extInfo),
  }
  return request(`/api/aidj/content/rcmd/info`, data, createOption(query))
}

export default async function migratedAidjContentRcmd(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
