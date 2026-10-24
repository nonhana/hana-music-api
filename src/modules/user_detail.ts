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
import { UserProfile } from '../core/upstream-schemas.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const ExpertRole = UpstreamObject({
  roleId: Loose(Schema.Finite),
  roleName: Loose(Schema.String),
});

const Binding = UpstreamObject({
  bindingTime: Loose(Schema.Finite),
  expired: Loose(Schema.Boolean),
  expiresIn: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  refreshTime: Loose(Schema.Finite),
  tokenJsonStr: Loose(Schema.String),
  type: Loose(Schema.Finite),
  url: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

const UserProduct = UpstreamObject({
  productionTypeId: Loose(Schema.Finite),
  productionTypeName: Loose(Schema.String),
});

const UserPoint = UpstreamObject({
  balance: Loose(Schema.Finite),
  blockBalance: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

// 返回码、用户资料的路径和编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    profile: UserProfile,
    adValid: Loose(Schema.Boolean),
    bindings: Loose(Schema.Array(Binding)),
    createDays: Loose(Schema.Finite),
    createTime: Loose(Schema.Finite),
    currentExpert: Loose(ExpertRole),
    expertArray: Loose(Schema.Array(ExpertRole)),
    identify: Loose(
      UpstreamObject({
        imageDesc: Loose(Schema.String),
        imageUrl: Loose(Schema.String),
      }),
    ),
    level: Loose(Schema.Finite),
    listenSongs: Loose(Schema.Finite),
    mobileSign: Loose(Schema.Boolean),
    newUser: Loose(Schema.Boolean),
    pcSign: Loose(Schema.Boolean),
    peopleCanSeeMyPlayRecord: Loose(Schema.Boolean),
    products: Loose(Schema.Array(UserProduct)),
    profileVillageInfo: Loose(
      UpstreamObject({
        targetUrl: Loose(Schema.String),
        title: Loose(Schema.String),
      }),
    ),
    recallUser: Loose(Schema.Boolean),
    userPoint: Loose(UserPoint),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        `/api/v1/user/detail/${query.uid}`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_detail', ModuleBody, result, {
        body: renameAvatarField(result.body),
      }),
    };
  });

export default userDetail;
