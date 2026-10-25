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

const Identify = UpstreamObject({
  imageUrl: Loose(Schema.String),
  imageDesc: Loose(Schema.String),
  actionUrl: Loose(Schema.String),
});

const VipRightInfo = UpstreamObject({
  vipCode: Loose(Schema.Finite),
  expireTime: Loose(Schema.Finite),
  vipLevel: Loose(Schema.Finite),
  sign: Loose(Schema.Boolean),
  signDeduct: Loose(Schema.Boolean),
  signIap: Loose(Schema.Boolean),
  signIapDeduct: Loose(Schema.Boolean),
});

const VipRights = UpstreamObject({
  rightsInfoDetailDtoList: Loose(Schema.Array(VipRightInfo)),
  oldProtocol: Loose(Schema.Boolean),
  redVipAnnualCount: Loose(Schema.Finite),
  redVipLevel: Loose(Schema.Finite),
  now: Loose(Schema.Finite),
});

const ArtistRank = UpstreamObject({
  rank: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

const ArtistDetail = UpstreamObject({
  id: Schema.Finite,
  cover: Loose(Schema.String),
  avatar: Loose(Schema.String),
  name: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
  alias: Loose(Schema.Array(Schema.String)),
  identifyTag: Loose(Schema.Array(Schema.String)),
  briefDesc: Loose(Schema.String),
  rank: Loose(ArtistRank),
  albumSize: Loose(Schema.Finite),
  musicSize: Loose(Schema.Finite),
  mvSize: Loose(Schema.Finite),
});

const SecondaryExpertIdentity = UpstreamObject({
  expertIdentiyId: Loose(Schema.Finite),
  expertIdentiyName: Loose(Schema.String),
  expertIdentiyCount: Loose(Schema.Finite),
});

const ArtistUser = UpstreamObject({
  ...PlaylistUser.schema.fields,
  authenticated: Loose(Schema.Boolean),
  userName: Loose(Schema.String),
  shortUserName: Loose(Schema.String),
  accountType: Loose(Schema.Finite),
  lastLoginIP: Loose(Schema.String),
  lastLoginTime: Loose(Schema.Finite),
  locationStatus: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
});

// 通到歌手详情的路径 `data.artist` 和歌手自己的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      videoCount: Loose(Schema.Finite),
      vipRights: Loose(VipRights),
      identify: Loose(Identify),
      artist: ArtistDetail,
      simpleUserIdentify: Loose(Identify),
      blacklist: Loose(Schema.Boolean),
      preferShow: Loose(Schema.Finite),
      showPriMsg: Loose(Schema.Boolean),
      secondaryExpertIdentiy: Loose(Schema.Array(SecondaryExpertIdentity)),
      eventCount: Loose(Schema.Finite),
      user: Loose(ArtistUser),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/head/info/get`,
        {
          id: query.id,
        },
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default artistDetail;
