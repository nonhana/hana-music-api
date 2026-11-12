import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  check: {
    profile: 'eapi',
    target: '/api/cloud/upload/check/v2',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
  import: {
    profile: 'eapi',
    target: '/api/cloud/user/song/import',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  album?: string;
  artist?: string;
  bitrate?: NumberValue;
  fileSize?: NumberValue;
  fileType?: string;
  id?: NumberId;
  md5?: string;
  song?: string;
};

const inputSchema = Schema.Struct({
  album: Schema.optional(Schema.String),
  artist: Schema.optional(Schema.String),
  bitrate: Schema.optional(NumberValue),
  fileSize: Schema.optional(NumberValue),
  fileType: Schema.optional(Schema.String),
  id: Schema.optional(NumberId),
  md5: Schema.optional(Schema.String),
  song: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const cloudImport: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const query = {
      ...input,
      id: input.id || -2,
      artist: input.artist || '未知',
      album: input.album || '未知',
    };
    const response = yield* request('check', {
      data: {
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
    });
    const body = response.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      !Array.isArray(body.data)
    ) {
      return yield* UnexpectedUpstreamShape.make({
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
      return yield* UnexpectedUpstreamShape.make({
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
    const importedResponse = yield* request('import', { data });
    return toModuleResponse(importedResponse);
  });

export default cloudImport;
