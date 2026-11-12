import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
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
    target: '/api/listen/together/room/create',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const RoomUser = UpstreamObject({
  avatarUrl: Loose(Schema.String),
  identityIcon: Loose(Schema.String),
  identityName: Loose(Schema.String),
  nickname: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

const RoomInfo = UpstreamObject({
  agoraChannelId: Loose(Schema.String),
  chatRoomId: Loose(Schema.String),
  creatorId: Loose(Schema.Finite),
  effectiveDurationMs: Loose(Schema.Finite),
  ltType: Loose(Schema.Finite),
  openHeartRcmd: Loose(Schema.Boolean),
  roomCreateTime: Loose(Schema.Finite),
  roomId: Schema.String,
  roomType: Loose(Schema.String),
  roomUsers: Loose(Schema.Array(RoomUser)),
  roomVipAbGroup: Loose(Schema.Record(Schema.String, Schema.String)),
  waitMs: Loose(Schema.Finite),
});

// 通到新房间的 `data.roomInfo` 和接口就是为了拿的 `data.roomInfo.roomId` 收紧；房主
// `creatorId`、房间成员和展示字段都是附带信息，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      avatarPendantShow: Loose(Schema.Boolean),
      roomInfo: RoomInfo,
      type: Loose(Schema.String),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherRoomCreate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {
      refer: 'songplay_more',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'listentogether_room_create',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听创建房间
 */
export default listentogetherRoomCreate;
