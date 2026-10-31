import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const StatusContent = UpstreamObject({
  type: Loose(Schema.String),
  iconUrl: Loose(Schema.String),
  content: Loose(Schema.String),
  actionUrl: Loose(Schema.String),
  canEdit: Loose(Schema.Boolean),
});

const IdentityInfo = UpstreamObject({
  type: Loose(Schema.String),
  vip: Loose(Schema.Boolean),
  name: Loose(Schema.String),
  level: Loose(Schema.Finite),
  description: Loose(Schema.String),
  detailDescription: Loose(Schema.String),
  showName: Loose(Schema.String),
  iconUrl: Loose(Schema.String),
  tags: Loose(Schema.Array(Schema.String)),
});

const TagRcmd = UpstreamObject({
  name: Loose(Schema.String),
  match: Loose(Schema.Boolean),
});

const RcmdUser = UpstreamObject({
  userId: Schema.Finite,
  nickName: Loose(Schema.String),
  avatarUrl: Loose(Schema.String),
  actionUrl: Loose(Schema.String),
  statusContentDTO: Loose(StatusContent),
  identityInfoDTO: Loose(IdentityInfo),
  tagRcmdVOList: Loose(Schema.Array(TagRcmd)),
});

// 返回码、相同状态用户列表 data.userRcmdInfoVOList 和每条记录的 userId 收紧（没有状态时列表整个缺失，写成可以没有）；当前状态和推荐理由宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      rcmdTitle: Loose(Schema.String),
      onlyShowState: Loose(Schema.Boolean),
      statusContentDTO: Loose(StatusContent),
      userRcmdInfoVOList: Optional(Schema.Array(RcmdUser)),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatusRcmd: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/social/user/status/rcmd`,
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_social_status_rcmd',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户状态 - 相同状态的用户
 */
export default userSocialStatusRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
