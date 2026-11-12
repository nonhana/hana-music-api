import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, UserProfile, VipRights } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/user/follow/users/mixed/get/v2',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const Scene = NumberLiterals([0, 1, 2]);

export type ModuleInput = {
  cursor?: number;
  scene?: 0 | 1 | 2;
  size?: number;
};

const inputSchema = Schema.Struct({
  cursor: Schema.optional(NaturalValue),
  scene: Schema.optional(Scene),
  size: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 关注记录里的用户资料：`userId` 是附带对象的编号，宽松；`urlAnalyze`、`vipRights`
// 是 `UserProfile` 之外的字段。
const MixedUser = UpstreamObject({
  ...UserProfile.schema.fields,
  userId: Loose(Schema.Finite),
  urlAnalyze: Loose(Schema.Boolean),
  vipRights: Loose(VipRights),
});

const FansGroupInfo = UpstreamObject({
  fansGroupIdStr: Loose(Schema.String),
  fansGroupInnerPageUrl: Loose(Schema.String),
  level: Loose(Schema.String),
  segment: Loose(Schema.String),
  showUpgrade: Loose(Schema.Boolean),
});

const ShowContentResource = UpstreamObject({
  coverUrl: Loose(Schema.String),
  orpheusUrl: Loose(Schema.String),
  picCount: Loose(Schema.Finite),
  resourceId: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
});

const ShowContentBox = UpstreamObject({
  resource: Loose(ShowContentResource),
  title: Loose(Schema.String),
});

// 记录上的动态展示内容；`fansActivityEntrance` 只在录制里见过 null，未声明。
const ShowContent = UpstreamObject({
  active: Loose(Schema.Boolean),
  boxContent: Loose(ShowContentBox),
  consumeParam: Loose(Schema.String),
  message: Loose(Schema.String),
  time: Loose(Schema.Finite),
});

// 关注混合列表的记录：艺术家记录没有 `userProfile`，用 `type`（2 艺术家、3 用户）区分。
const FollowRecord = UpstreamObject({
  followId: Schema.Finite,
  artistInfo: Loose(Artist),
  fansGroupInfo: Loose(FansGroupInfo),
  followDay: Loose(Schema.String),
  followTime: Loose(Schema.Finite),
  showContent: Loose(ShowContent),
  type: Loose(Schema.Finite),
  userProfile: Optional(MixedUser),
});

const Page = UpstreamObject({
  cursor: Loose(Schema.String),
  more: Loose(Schema.Boolean),
  size: Loose(Schema.Finite),
});

const ExtData = UpstreamObject({
  visualStyle: Loose(Schema.String),
});

const FollowData = UpstreamObject({
  records: Schema.Array(FollowRecord),
  extData: Loose(ExtData),
  page: Loose(Page),
});

// 通到关注列表的路径 `data.records` 和每条记录的编号 `data.records[].followId` 收紧；越界 cursor 返回空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: FollowData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userFollowMixed: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const size = query.size || 30;
    const cursor = query.cursor || 0;
    const scene = query.scene || 0; // 0: 所有关注 1: 关注的歌手 2: 关注的用户
    const data = {
      authority: 'false',
      page: JSON.stringify({
        size,
        cursor,
      }),
      scene,
      size,
      sortType: '0',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'user_follow_mixed',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 当前账号关注的用户/歌手
 */
export default userFollowMixed;
