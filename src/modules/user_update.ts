import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userUpdate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      // avatarImgId: '0',
      birthday: query.birthday,
      city: query.city,
      gender: query.gender,
      nickname: query.nickname,
      province: query.province,
      signature: query.signature,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/user/profile/update`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 编辑用户信息
 */
export default userUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
