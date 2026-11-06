import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  UploadedFile,
} from '../core/module-input.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import uploadPlugin from '../plugins/upload.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/module-shared.ts';

export type ModuleInput = {
  imgFile?: LegacyUploadedFile;
};

const inputSchema = Schema.Struct({
  imgFile: Schema.optional(UploadedFile),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const avatarUpload: ModuleEffect<ModuleInput> = (input, request) =>
  uploadWork('avatar_upload', request, (stage) =>
    Effect.gen(function* () {
      const call = yield* Call;
      const uploaded = yield* uploadPlugin(input, stage);
      const response = yield* stage({
        target: '/api/user/avatar/upload/v1',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({ imgid: uploaded.imgId }),
        response: 'json',
        semantic: 'upload',
      });
      if (!isRecord(response.body)) {
        return yield* new UnexpectedUpstreamShape({
          module: 'avatar_upload',
          path: 'body',
          expected: 'object',
          actual: typeof response.body,
        });
      }
      return {
        status: 200,
        cookie: [],
        body: { code: 200, data: { ...uploaded, ...response.body } },
      };
    }),
  );

export default avatarUpload;
