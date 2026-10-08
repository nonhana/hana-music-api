import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { allocateImageUpload } from '../plugins/upload.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = {};

export type ModuleBody = {
  code: 200;
  data: {
    imgId: QueryIdentifier;
    token: string;
    uploadUrl: string;
    url_pre: string;
  };
};

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
