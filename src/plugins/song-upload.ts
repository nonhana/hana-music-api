import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import {
  buildActionRequestIntent,
  buildPlainActionRequestIntent,
} from '../core/request-intent.ts';
import { isRecord } from '../core/utils.ts';
import type { RequestCapability } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/module-shared.ts';

export const songUploadActions = {
  songAllocate: {
    profile: 'weapiPc',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  songLookup: {
    profile: 'plainLookup',
    target: '/lbs',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
    method: 'GET',
    response: 'json',
  },
  songUpload: {
    profile: 'plainNos',
    target: { prefix: '/jd-musicrep-privatecloud-audio-public/' },
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'POST',
    response: 'bytes',
  },
} as const satisfies ModuleActions;

export type UploadSongQuery = { songFile?: LegacyUploadedFile };

export default (input: UploadSongQuery, request: RequestCapability) =>
  Effect.gen(function* () {
    if (!input.songFile) {
      return yield* InvalidModuleInput.make({
        message: 'songFile is required for song upload plugin',
        status: 502,
      });
    }
    const call = yield* Call;
    const dotIndex = input.songFile.name.lastIndexOf('.');
    const ext = dotIndex >= 0 ? input.songFile.name.slice(dotIndex + 1) : 'mp3';
    const filename = input.songFile.name
      .replace('.' + ext, '')
      .replace(/\s/g, '')
      .replace(/\./g, '_');
    const bucket = 'jd-musicrep-privatecloud-audio-public';
    const allocation = yield* request(
      buildActionRequestIntent(
        'songAllocate',
        songUploadActions.songAllocate,
        {
          bucket,
          ext,
          filename,
          local: false,
          nos_product: 3,
          type: 'audio',
          md5: input.songFile.md5,
        },
        undefined,
        {},
      ),
    );
    const { result: token } = yield* Schema.decodeUnknownEffect(
      Schema.Struct({
        result: Schema.Struct({
          objectKey: Schema.String,
          token: Schema.String,
        }),
      }),
    )(allocation.body).pipe(
      Effect.mapError(() =>
        UnexpectedUpstreamShape.make({
          module: call.identifier,
          path: 'result',
          expected: 'objectKey and token',
          actual: typeof allocation.body,
        }),
      ),
    );
    const lookup = yield* request(
      buildPlainActionRequestIntent(
        'songLookup',
        songUploadActions.songLookup,
        `https://wanproxy.127.net/lbs?version=1.0&bucketname=${bucket}`,
        { headers: {} },
      ),
    );
    const uploadBase =
      isRecord(lookup.body) && Array.isArray(lookup.body.upload)
        ? lookup.body.upload[0]
        : undefined;
    if (typeof uploadBase !== 'string' || !uploadBase) {
      return yield* UnexpectedUpstreamShape.make({
        module: call.identifier,
        path: 'upload[0]',
        expected: 'upload URL',
        actual: typeof uploadBase,
      });
    }
    yield* request(
      buildPlainActionRequestIntent(
        'songUpload',
        songUploadActions.songUpload,
        `${uploadBase}/${bucket}/${encodeURIComponent(token.objectKey)}?offset=0&complete=true&version=1.0`,
        {
          headers: {
            'x-nos-token': token.token,
            'Content-MD5': input.songFile.md5 ?? '',
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(input.songFile.size),
          },
          body:
            input.songFile.data instanceof ArrayBuffer
              ? new Uint8Array(input.songFile.data)
              : input.songFile.data,
        },
      ),
    );
    return allocation;
  });
