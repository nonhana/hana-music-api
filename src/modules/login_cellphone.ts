import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LoginCellphoneQuery } from '../types/modules.ts'
// 手机登录

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LoginCellphoneQuery, request: ModuleRequest) => {
  const data = {
    type: '1',
    https: 'true',
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    [query.captcha ? 'captcha' : 'password']: query.captcha
      ? query.captcha
      : query.md5_password || createHash('md5').update(String(query.password)).digest('hex'),
    remember: 'true',
  }
  let result = await request(`/api/w/login/cellphone`, data, createOption(query, 'weapi'))

  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...JSON.parse(JSON.stringify(result.body).replace(/avatarImgId_str/g, 'avatarImgIdStr')),
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}

export default async function migratedLoginCellphone(
  query: LoginCellphoneQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
