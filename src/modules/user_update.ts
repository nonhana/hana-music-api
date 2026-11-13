import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/user/profile/update',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const Gender = NumberLiterals([0, 1, 2]);

export type ModuleInput = {
  birthday?: number;
  city?: number;
  gender?: 0 | 1 | 2;
  nickname?: string;
  province?: number;
  signature?: string;
};

const inputSchema = Schema.Struct({
  birthday: Schema.optional(NaturalValue),
  city: Schema.optional(NaturalValue),
  gender: Schema.optional(Gender),
  nickname: Schema.optional(Schema.String),
  province: Schema.optional(NaturalValue),
  signature: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userUpdate: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
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
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 编辑用户信息
 */
export default userUpdate;
