import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Introduction = UpstreamObject({
  ti: Loose(Schema.String),
  txt: Loose(Schema.String),
});

// 专栏创建者是宽松字段里套着的用户，编号也宽松。
const TopicCreator = UpstreamObject({
  ...PlaylistUser.schema.fields,
  accountType: Loose(Schema.Finite),
  authenticated: Loose(Schema.Boolean),
  createTime: Loose(Schema.Finite),
  lastLoginIP: Loose(Schema.String),
  lastLoginTime: Loose(Schema.Finite),
  locationStatus: Loose(Schema.Finite),
  shortUserName: Loose(Schema.String),
  userName: Loose(Schema.String),
  viptypeVersion: Loose(Schema.Finite),
});

const TopicContent = UpstreamObject({
  content: Loose(Schema.String),
  id: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

const Topic = UpstreamObject({
  addTime: Loose(Schema.Finite),
  adInfo: Loose(Schema.String),
  auditor: Loose(Schema.String),
  auditStatus: Loose(Schema.Finite),
  auditTime: Loose(Schema.Finite),
  categoryId: Loose(Schema.Finite),
  content: Loose(Schema.Array(TopicContent)),
  cover: Loose(Schema.Finite),
  delReason: Loose(Schema.String),
  fromBackend: Loose(Schema.Boolean),
  headPic: Loose(Schema.Finite),
  hotScore: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  mainTitle: Loose(Schema.String),
  memo: Loose(Schema.String),
  number: Loose(Schema.Finite),
  pubImmidiatly: Loose(Schema.Boolean),
  pubTime: Loose(Schema.Finite),
  readCount: Loose(Schema.Finite),
  recomdContent: Loose(Schema.String),
  recomdTitle: Loose(Schema.String),
  rectanglePic: Loose(Schema.Finite),
  reward: Loose(Schema.Boolean),
  seriesId: Loose(Schema.Finite),
  shareContent: Loose(Schema.String),
  showComment: Loose(Schema.Boolean),
  showRelated: Loose(Schema.Boolean),
  startText: Loose(Schema.String),
  status: Loose(Schema.Finite),
  summary: Loose(Schema.String),
  tags: Loose(Schema.Array(Schema.String)),
  title: Loose(Schema.String),
  updateTime: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  wxTitle: Loose(Schema.String),
});

const TopicArticle = UpstreamObject({
  addTime: Loose(Schema.Finite),
  categoryId: Loose(Schema.Finite),
  categoryName: Loose(Schema.String),
  commentCount: Loose(Schema.Finite),
  commentThreadId: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  creator: Loose(TopicCreator),
  id: Loose(Schema.Finite),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  mainTitle: Loose(Schema.String),
  memo: Loose(Schema.String),
  number: Loose(Schema.Finite),
  readCount: Loose(Schema.Finite),
  recmdContent: Loose(Schema.String),
  recmdTitle: Loose(Schema.String),
  rectanglePicUrl: Loose(Schema.String),
  reward: Loose(Schema.Boolean),
  rewardCount: Loose(Schema.Finite),
  rewardMoney: Loose(Schema.Finite),
  seriesId: Loose(Schema.Finite),
  shareContent: Loose(Schema.String),
  shareCount: Loose(Schema.Finite),
  showComment: Loose(Schema.Boolean),
  showRelated: Loose(Schema.Boolean),
  summary: Loose(Schema.String),
  tags: Loose(Schema.Array(Schema.String)),
  title: Loose(Schema.String),
  topic: Loose(Topic),
  url: Loose(Schema.String),
  wxTitle: Loose(Schema.String),
});

// 通到歌手介绍正文的路径 `introduction` 收紧；`briefDesc` 是摘要、`topicData` 是相关专栏，都是宽松字段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    briefDesc: Loose(Schema.String),
    count: Loose(Schema.Finite),
    introduction: Schema.Array(Introduction),
    topicData: Loose(Schema.Array(TopicArticle)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistDesc: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/introduction`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('artist_desc', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手介绍
 */
export default artistDesc;
