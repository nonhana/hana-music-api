import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import type * as QRCode from 'qrcode';

import { ModuleInvariantFailed } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  IntegerValue,
} from '../core/module-input.ts';
import {
  isMissingOptionalDependencyError,
  loadOptionalDependency,
} from '../core/optional-dependency.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/frontrisk/verify/getqrcode',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  evid?: string;
  sign?: string;
  token?: string;
  type?: number;
  vid?: string;
};

const inputSchema = Schema.Struct({
  evid: Schema.optional(Schema.String),
  sign: Schema.optional(Schema.String),
  token: Schema.optional(Schema.String),
  type: Schema.optional(IntegerValue),
  vid: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const upstreamSchema = UpstreamObject({
  data: UpstreamObject({ qrCode: Schema.String }),
});

// 返回码、验证数据路径和二维码字段都是接口要拿的那一项，全部收紧。
// 返回体由 SDK 自己拼出：`qrurl` 是手机上完成行为验证的页面，`qrimg` 是它的二维码图片（data URL）。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  Schema.Struct({
    code: Schema.Literal(200),
    data: Schema.Struct({
      qrCode: Schema.String,
      qrurl: Schema.String,
      qrimg: Schema.String,
    }),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const verifyGetQr: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const params = JSON.stringify({ event_id: query.evid, sign: query.sign });
    const response = yield* request('request', {
      data: {
        verifyConfigId: query.vid,
        verifyType: query.type,
        token: query.token,
        params,
        size: 150,
      },
    });
    const { qrCode } = (yield* decodeUpstreamBody(
      'verify_getQr',
      upstreamSchema,
      response,
    )).data;
    const qrurl = `https://st.music.163.com/encrypt-pages?qrCode=${qrCode}&verifyToken=${query.token}&verifyId=${query.vid}&verifyType=${query.type}&params=${params}`;
    const qrimg = yield* Effect.tryPromise({
      try: async () => {
        const qrcode = await loadOptionalDependency<typeof QRCode>('qrcode');
        return qrcode.toDataURL(qrurl);
      },
      catch: (error) =>
        ModuleInvariantFailed.make({
          message: isMissingOptionalDependencyError(error, 'qrcode')
            ? "Generating QR code images requires installing optional peer dependency 'qrcode'"
            : String(error),
        }),
    });
    return {
      status: 200,
      cookie: [],
      body: { code: 200 as const, data: { qrCode, qrurl, qrimg } },
    };
  });

export default verifyGetQr;
