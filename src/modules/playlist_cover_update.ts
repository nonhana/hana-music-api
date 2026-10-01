import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import uploadPlugin from '../plugins/upload.ts';
import type { ModuleEffect, ModuleResponse } from '../types/index.ts';
import type {
  LegacyUploadedFile,
  QueryIdentifier,
} from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  UploadedFile,
} from './_input.ts';

export type ModuleInput = {
  imgFile?: LegacyUploadedFile;

  id?: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  imgFile: Schema.optional(UploadedFile),
  id: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const playlistCoverUpdate: ModuleEffect<ModuleInput> = (input, request) =>
  uploadWork('playlist_cover_update', request, (stage) =>
    Effect.gen(function* () {
      if (!input.imgFile) {
        return yield* Effect.succeed<ModuleResponse>({
          status: 400,
          cookie: [],
          body: { code: 400, msg: 'imgFile is required' },
        });
      }
      const call = yield* Call;
      const uploaded = yield* uploadPlugin(input, stage);
      const response = yield* stage({
        target: '/api/playlist/cover/update',
        protocol: call.config.crypto || 'weapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({ id: input.id, coverImgId: uploaded.imgId }),
        response: 'json',
        semantic: 'write',
      });
      if (!isRecord(response.body)) {
        return yield* new UnexpectedUpstreamShape({
          module: 'playlist_cover_update',
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

export default playlistCoverUpdate;
