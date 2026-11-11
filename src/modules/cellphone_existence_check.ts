import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/cellphone/existence/check',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  countrycode?: NumberId;
  phone: string;
};

const inputSchema = Schema.Struct({
  countrycode: Schema.optional(NumberId),
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码和手机号是否已注册的 `exist` 收紧（`1` 已注册、`-1` 未注册）；`avatarUrl`、`cellphone`、`countryCode`、`hasPassword`、`hasSnsBinded`、`nickname` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    exist: Schema.Finite,
    avatarUrl: Loose(Schema.String),
    cellphone: Loose(Schema.String),
    countryCode: Loose(Schema.String),
    hasPassword: Loose(Schema.Boolean),
    hasSnsBinded: Loose(Schema.Boolean),
    nickname: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const cellphoneExistenceCheck: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cellphone: query.phone,
      countrycode: query.countrycode,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'cellphone_existence_check',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 检测手机号码是否已注册
 */
export default cellphoneExistenceCheck;
