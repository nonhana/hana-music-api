import { Effect } from 'effect';

import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { UnknownJson } from '../types/unknown.ts';
// 签到
/*
    0为安卓端签到 3点经验, 1为网页签到,2点经验
    签到成功 {'android': {'point': 3, 'code': 200}, 'web': {'point': 2, 'code': 200}}
    重复签到 {'android': {'code': -2, 'msg': '重复签到'}, 'web': {'code': -2, 'msg': '重复签到'}}
    未登录 {'android': {'code': 301}, 'web': {'code': 301}}
*/
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/point/dailyTask',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const dailySignin: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 0,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default dailySignin;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
