import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { UpstreamObject } from '../core/upstream-body.ts';
import { allocateImageUpload } from '../plugins/upload.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

// 返回码、上传凭证路径和凭证字段都是接口要拿的那一项，全部收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      imgId: Schema.Union([Schema.String, Schema.Finite]),
      token: Schema.String,
      uploadUrl: Schema.String,
      url_pre: Schema.String,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const imageUploadToken: ModuleEffect<ModuleInput, ModuleBody> = (
  _input,
  request,
) =>
  allocateImageUpload('image.jpg', request).pipe(
    Effect.map((data) => ({
      status: 200,
      cookie: [],
      body: { code: 200, data },
    })),
  );

export default imageUploadToken;
