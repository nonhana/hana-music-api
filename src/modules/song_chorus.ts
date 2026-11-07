import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Chorus = UpstreamObject({
  id: Schema.Finite,
  endTime: Loose(Schema.Finite),
  startTime: Loose(Schema.Finite),
  ugcLocked: Loose(Schema.Finite),
});

// 通到副歌时间的路径 `chorus` 和 `data` 是同一组记录，每条记录的 `id` 收紧；起止时间和 `ugcLocked` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    chorus: Schema.Array(Chorus),
    data: Schema.Array(Chorus),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/chorus',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songChorus: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildActionRequestIntent('read', moduleActions.read, {
        ids: JSON.stringify([query.id]),
      }),
    );
    const body = yield* decodeUpstreamBody('song_chorus', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 副歌时间
 */
export default songChorus;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
