import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile } from '../core/upstream-schemas.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: { prefix: '/api/v1/user/detail/' },
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

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

const ExpertRole = UpstreamObject({
  roleId: Loose(Schema.Finite),
  roleName: Loose(Schema.String),
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
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    profile: UserProfile,
    adValid: Loose(Schema.Boolean),
    bindings: Binding.pipe(Schema.Array, Loose),
    createDays: Loose(Schema.Finite),
    createTime: Loose(Schema.Finite),
    currentExpert: Loose(ExpertRole),
    expertArray: ExpertRole.pipe(Schema.Array, Loose),
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
    products: UserProduct.pipe(Schema.Array, Loose),
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
export type ModuleBody = BodyType<typeof ModuleBody>;

const userDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', {
      data: {},
      path: `/api/v1/user/detail/${query.uid}`,
    });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_detail', ModuleBody, result, {
        body: renameAvatarField(result.body),
      }),
    };
  });

export default userDetail;
