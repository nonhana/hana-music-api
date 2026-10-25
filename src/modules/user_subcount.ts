import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 返回码收紧；接口要返回的各项收藏计数平铺在正文，少一项只是少一项信息，全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artistCount: Loose(Schema.Finite),
    createDjRadioCount: Loose(Schema.Finite),
    createdPlaylistCount: Loose(Schema.Finite),
    djRadioCount: Loose(Schema.Finite),
    mvCount: Loose(Schema.Finite),
    newProgramCount: Loose(Schema.Finite),
    programCount: Loose(Schema.Finite),
    subPlaylistCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSubcount: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(`/api/subcount`, {}, createOption(query, 'weapi')),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_subcount', ModuleBody, result),
    };
  });

/**
 * 收藏计数
 */
export default userSubcount;
