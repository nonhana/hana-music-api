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
    profile: 'web',
    target: '/api/sign/happy/info',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const HotComment = UpstreamObject({
  authorName: Loose(Schema.String),
  content: Loose(Schema.String),
});

const SignHappyInfo = UpstreamObject({
  id: Schema.Finite,
  author: Loose(Schema.String),
  backColor: Loose(Schema.String),
  currentUserName: Loose(Schema.String),
  endTime: Loose(Schema.Finite),
  hotComments: Loose(Schema.Array(HotComment)),
  jumpUrl: Loose(Schema.String),
  mainText: Loose(Schema.String),
  newPicUrl: Loose(Schema.String),
  newSharePicUrl: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  qrCodeUrl: Loose(Schema.String),
  qrCodeWithLogoUrl: Loose(Schema.String),
  resourceAuthor: Loose(Schema.String),
  resourceCover: Loose(Schema.String),
  resourceId: Loose(Schema.Finite),
  resourceName: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  resourceUrl: Loose(Schema.String),
  sharePicUrl: Loose(Schema.String),
  startTime: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  videoHeight: Loose(Schema.Finite),
  videoWidth: Loose(Schema.Finite),
});

// 返回码和签到活动信息的路径 `data.info` 及活动记录 `id` 收紧；活动文案、资源与热评字段宽松，
// 只见过 null 的 `jumpText`、`specialJumpUrl`、`btnPicUrl`、`operator`、`videoStrId` 未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      info: SignHappyInfo,
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const signHappyInfo: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'sign_happy_info',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 签到活动信息
 */
export default signHappyInfo;
