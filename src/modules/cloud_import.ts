import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from './_input.ts';

export type ModuleInput = {
  album?: string;
  artist?: string;
  bitrate?: QueryNumberLike;
  fileSize?: QueryNumberLike;
  fileType?: string;
  id?: QueryIdentifier;
  md5?: string;
  song?: string;
};

const inputSchema = Schema.Struct({
  album: Schema.optional(Schema.String),
  artist: Schema.optional(Schema.String),
  bitrate: Schema.optional(QueryNumber),
  fileSize: Schema.optional(QueryNumber),
  fileType: Schema.optional(Schema.String),
  id: Schema.optional(Identifier),
  md5: Schema.optional(Schema.String),
  song: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const cloudImport: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = {
      ...input,
      id: input.id || -2,
      artist: input.artist || '未知',
      album: input.album || '未知',
    };
    const response = yield* request(
      buildApiRequestIntent(
        '/api/cloud/upload/check/v2',
        {
          uploadType: 0,
          songs: JSON.stringify([
            {
              md5: query.md5,
              songId: query.id,
              bitrate: query.bitrate,
              fileSize: query.fileSize,
            },
          ]),
        },
        createOption(query),
      ),
    );
    const body = response.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      !Array.isArray(body.data)
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'cloud_import',
        path: 'body.data',
        expected: 'array',
        actual: typeof body,
      });
    }
    const first = body.data[0];
    if (
      first === null ||
      typeof first !== 'object' ||
      Array.isArray(first) ||
      (typeof first.songId !== 'number' && typeof first.songId !== 'string')
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'cloud_import',
        path: 'body.data[0].songId',
        expected: 'number or string',
        actual: typeof first,
      });
    }
    const data = {
      uploadType: 0,
      songs: JSON.stringify([
        {
          songId: first.songId,
          bitrate: query.bitrate,
          song: query.song,
          artist: query.artist,
          album: query.album,
          fileName: query.song + '.' + query.fileType,
        },
      ]),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          '/api/cloud/user/song/import',
          data,
          createOption(query),
        ),
      ),
    );
  });

export default cloudImport;
