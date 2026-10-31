import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码收紧；接口返回的私信、通知、关注等计数平铺在正文，少一项只是少一项信息，全部宽松（同 user_subcount）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    battle: Loose(
      UpstreamObject({
        endTime: Loose(Schema.Finite),
        showQuizIcon: Loose(Schema.Boolean),
        startTime: Loose(Schema.Finite),
      }),
    ),
    comment: Loose(Schema.Finite),
    createDJRadioCount: Loose(Schema.Finite),
    event: Loose(Schema.Finite),
    eventUser: Loose(
      UpstreamObject({
        eventId: Loose(Schema.Finite),
        source: Loose(Schema.Finite),
        style: Loose(Schema.Finite),
        userAvatar: Loose(Schema.String),
        userId: Loose(Schema.Finite),
      }),
    ),
    follow: Loose(Schema.Finite),
    forward: Loose(Schema.Finite),
    friend: Loose(
      UpstreamObject({
        celebrityCount: Loose(Schema.Finite),
        count: Loose(Schema.Finite),
        snsCount: Loose(Schema.Finite),
      }),
    ),
    invitationVersion: Loose(Schema.Finite),
    msg: Loose(Schema.Finite),
    newProgramCount: Loose(Schema.Finite),
    newTheme: Loose(Schema.Boolean),
    notice: Loose(Schema.Finite),
    pushMsg: Loose(Schema.String),
    sceneComments: Loose(
      UpstreamObject({
        musician_comments: Loose(Schema.Finite),
        social_comments: Loose(Schema.Finite),
      }),
    ),
    totalComment: Loose(Schema.Finite),
    ydAntiUrlConfigVersion: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const plCount: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/pl/count`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('pl_count', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 私信和通知接口
 */
export default plCount;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
