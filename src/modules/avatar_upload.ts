import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  UploadedFile,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import uploadPlugin, { imageUploadActions } from '../plugins/upload.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/module-shared.ts';

export const moduleActions = {
  ...imageUploadActions,
  submit: {
    profile: 'eapi',
    target: '/api/user/avatar/upload/v1',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

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
      const uploaded = yield* uploadPlugin(input, stage);
      const response = yield* stage(
        buildActionRequestIntent('submit', moduleActions.submit, {
          imgid: uploaded.imgId,
        }),
      );
      if (!isRecord(response.body)) {
        return yield* UnexpectedUpstreamShape.make({
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
