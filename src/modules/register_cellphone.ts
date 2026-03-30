// 注册账号
import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { RegisterCellphoneQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: RegisterCellphoneQuery, request: ModuleRequest) => {
  const data = {
    captcha: query.captcha,
    phone: query.phone,
    password: createHash('md5').update(String(query.password)).digest('hex'),
    nickname: query.nickname,
    countrycode: query.countrycode || '86',
    force: 'false',
  }
  return request(`/api/w/register/cellphone`, data, createOption(query))
}

export default async function migratedRegisterCellphone(
  query: RegisterCellphoneQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
