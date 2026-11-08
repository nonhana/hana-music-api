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

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/listen/together/room/check',
    semantic: 'poll',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const RoomCheck = UpstreamObject({
  joinable: Schema.Boolean,
  status: Schema.String,
  copywriting: Loose(Schema.String),
});

// 通到房间情况的 `data` 和接口就是为了拿的 `data.joinable`、`data.status` 收紧；
// `copywriting` 是展示文案，宽松；`type` 在录制里只见过 `null`，不声明，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: RoomCheck,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherRoomCheck: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_room_check',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听 房间情况
 */
export default listentogetherRoomCheck;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
