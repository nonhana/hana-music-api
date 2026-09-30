import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
// 签到
/*
    0为安卓端签到 3点经验, 1为网页签到,2点经验
    签到成功 {'android': {'point': 3, 'code': 200}, 'web': {'point': 2, 'code': 200}}
    重复签到 {'android': {'code': -2, 'msg': '重复签到'}, 'web': {'code': -2, 'msg': '重复签到'}}
    未登录 {'android': {'code': 301}, 'web': {'code': 301}}
*/
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';

const dailySignin: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/point/dailyTask`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default dailySignin;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
