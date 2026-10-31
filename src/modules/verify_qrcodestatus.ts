import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码、状态路径 `data` 和二维码状态 `qrCodeStatus` 收紧；原因提示 `detailReason` 与 `message` 宽松。
// 上游把成功码写成字符串 `"200"`，请求层会把它归一成数字 200；结构定义同时接受两者。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literals([200, '200']),
    data: UpstreamObject({
      qrCodeStatus: Schema.Finite,
      detailReason: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const verifyQrcodestatus: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      qrCode: query.qr,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/frontrisk/verify/qrcodestatus`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'verify_qrcodestatus',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default verifyQrcodestatus;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
