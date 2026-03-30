import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserBindingCellphoneQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserBindingCellphoneQuery, request: ModuleRequest) => {
  const data = {
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    password: query.password ? createHash('md5').update(String(query.password)).digest('hex') : '',
  }
  return request(`/api/user/bindingCellphone`, data, createOption(query, 'weapi'))
}

export default async function migratedUserBindingcellphone(
  query: UserBindingCellphoneQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
