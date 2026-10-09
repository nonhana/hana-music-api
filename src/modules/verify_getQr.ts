import { Effect, Schema } from 'effect';
import * as QRCode from 'qrcode';

import { ModuleInvariantFailed } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  evid?: string;
  sign?: string;
  token?: string;
  type?: number | string;
  vid?: string;
};

const inputSchema = Schema.Struct({
  evid: Schema.optional(Schema.String),
  sign: Schema.optional(Schema.String),
  token: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Union([Schema.Finite, Schema.String])),
  vid: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const upstreamSchema = UpstreamObject({
  data: UpstreamObject({ qrCode: Schema.String }),
});

// 返回体由 SDK 自己拼出：`qrurl` 是手机上完成行为验证的页面，`qrimg` 是它的二维码图片（data URL）。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Struct({
    code: Schema.Literal(200),
    data: Schema.Struct({
      qrCode: Schema.String,
      qrurl: Schema.String,
      qrimg: Schema.String,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const verifyGetQr: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const params = JSON.stringify({ event_id: query.evid, sign: query.sign });
    const response = yield* request(
      buildApiRequestIntent(
        '/api/frontrisk/verify/getqrcode',
        {
          verifyConfigId: query.vid,
          verifyType: query.type,
          token: query.token,
          params,
          size: 150,
        },
        createOption(query, 'weapi'),
      ),
    );
    const { qrCode } = (yield* decodeUpstreamBody(
      'verify_getQr',
      upstreamSchema,
      response,
    )).data;
    const qrurl = `https://st.music.163.com/encrypt-pages?qrCode=${qrCode}&verifyToken=${query.token}&verifyId=${query.vid}&verifyType=${query.type}&params=${params}`;
    const qrimg = yield* Effect.tryPromise({
      try: () => QRCode.toDataURL(qrurl),
      catch: (error) => new ModuleInvariantFailed({ message: String(error) }),
    });
    return {
      status: 200,
      cookie: [],
      body: { code: 200 as const, data: { qrCode, qrurl, qrimg } },
    };
  });

export default verifyGetQr;
