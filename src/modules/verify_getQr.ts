import { Effect, Schema } from 'effect';
import * as QRCode from 'qrcode';

import {
  ModuleInvariantFailed,
  UnexpectedUpstreamShape,
} from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import type { ModuleEffect } from '../types/index.ts';
import { decodeModuleInput as decodeInput } from './_input.ts';

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

const verifyGetQr: ModuleEffect<ModuleInput> = (query, request) =>
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
    const body = response.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      body.data === null ||
      typeof body.data !== 'object' ||
      Array.isArray(body.data) ||
      typeof body.data.qrCode !== 'string'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'verify_getQr',
        path: 'body.data.qrCode',
        expected: 'string',
        actual: typeof body,
      });
    }
    const qrCode = body.data.qrCode;
    const qrurl = `https://st.music.163.com/encrypt-pages?qrCode=${qrCode}&verifyToken=${query.token}&verifyId=${query.vid}&verifyType=${query.type}&params=${params}`;
    const qrimg = yield* Effect.tryPromise({
      try: () => QRCode.toDataURL(qrurl),
      catch: (error) => new ModuleInvariantFailed({ message: String(error) }),
    });
    return {
      status: 200,
      cookie: [],
      body: { code: 200, data: { qrCode, qrurl, qrimg } },
    };
  });

export default verifyGetQr;
