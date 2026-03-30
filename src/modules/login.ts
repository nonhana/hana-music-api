import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LoginQuery } from '../types/modules.ts'
// 邮箱登录

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LoginQuery, request: ModuleRequest) => {
  const data = {
    type: '0',
    https: 'true',
    username: query.email,
    password: query.md5_password || createHash('md5').update(String(query.password)).digest('hex'),
    rememberLogin: 'true',
  }
  let result = await request(`/api/w/login`, data, createOption(query))
  if (result.body.code === 502) {
    return {
      status: 200,
      body: {
        msg: '账号或密码错误',
        code: 502,
        message: '账号或密码错误',
      },
    }
  }
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

export default async function migratedLogin(
  query: LoginQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
