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
  roomId: Loose(Schema.String),
  roomType: Loose(Schema.String),
  roomUsers: Loose(Schema.Array(RoomUser)),
  roomVipAbGroup: Loose(Schema.Record(Schema.String, Schema.String)),
  waitMs: Loose(Schema.Finite),
});

// 接口就是为了确认接受邀请成功：正文顶层的返回码 `code` 收紧。没有第二账号的真实邀请，只录到
// 接受自己房间时的 `ALREADY_IN_ROOM`（`data.roomInfo` 是当前房间），新加入成员的路径没有证据，
// 所以 `data` 及房间信息整体宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(
      UpstreamObject({
        hintText: Loose(Schema.String),
        roomInfo: Loose(RoomInfo),
        type: Loose(Schema.String),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherAccept: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      refer: 'inbox_invite',
      roomId: query.roomId,
      inviterId: query.inviterId,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/listen/together/play/invitation/accept`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_accept',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default listentogetherAccept;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
