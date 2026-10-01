import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';
import * as metadata from 'music-metadata';

import { Call } from '../core/call.ts';
import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  UploadedFile,
} from '../core/module-input.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import uploadSongPlugin from '../plugins/song-upload.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/module-shared.ts';

export type ModuleInput = {
  songFile?: LegacyUploadedFile;
};

const inputSchema = Schema.Struct({
  songFile: Schema.optional(UploadedFile),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const cloud: ModuleEffect<ModuleInput> = (input, request) =>
  uploadWork('cloud', request, (stage) =>
    Effect.gen(function* () {
      if (!input.songFile) {
        return yield* new InvalidModuleInput({
          message: '请上传音乐文件',
          status: 500,
        });
      }
      const call = yield* Call;
      const bytes =
        input.songFile.data instanceof ArrayBuffer
          ? new Uint8Array(input.songFile.data)
          : input.songFile.data;
      const dotIndex = input.songFile.name.lastIndexOf('.');
      const ext =
        dotIndex >= 0 ? input.songFile.name.slice(dotIndex + 1) : 'mp3';
      const songFile = {
        ...input.songFile,
        name: Buffer.from(input.songFile.name, 'latin1').toString('utf-8'),
        md5:
          input.songFile.md5 || createHash('md5').update(bytes).digest('hex'),
        size: input.songFile.md5 ? input.songFile.size : bytes.byteLength,
      };
      const filename = songFile.name
        .replace('.' + ext, '')
        .replace(/\s/g, '')
        .replace(/\./g, '_');
      const checked = yield* stage({
        target: '/api/cloud/upload/check',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          bitrate: '999000',
          ext: '',
          length: songFile.size,
          md5: songFile.md5,
          songId: '0',
          version: 1,
        }),
        response: 'json',
        semantic: 'upload',
      });
      const check = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          needUpload: Schema.Boolean,
          songId: Schema.Union([Schema.String, Schema.Finite]),
        }),
      )(checked.body).pipe(
        Effect.mapError(
          () =>
            new UnexpectedUpstreamShape({
              module: 'cloud',
              path: 'body',
              expected: 'needUpload and songId',
              actual: typeof checked.body,
            }),
        ),
      );
      const tags = yield* Effect.tryPromise(() =>
        metadata.parseBuffer(bytes, songFile.mimetype),
      ).pipe(
        Effect.map((info) => info.common),
        Effect.orElseSucceed(() => ({ title: '', album: '', artist: '' })),
      );
      const allocation = yield* stage({
        target: '/api/nos/token/alloc',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          bucket: '',
          ext,
          filename,
          local: false,
          nos_product: 3,
          type: 'audio',
          md5: songFile.md5,
        }),
        response: 'json',
        semantic: 'upload',
      });
      const { result: token } = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          result: Schema.Struct({
            resourceId: Schema.Union([Schema.String, Schema.Finite]),
          }),
        }),
      )(allocation.body).pipe(
        Effect.mapError(
          () =>
            new UnexpectedUpstreamShape({
              module: 'cloud',
              path: 'result.resourceId',
              expected: 'resource identifier',
              actual: typeof allocation.body,
            }),
        ),
      );
      if (check.needUpload) {
        yield* uploadSongPlugin({ ...input, songFile }, stage);
      }
      const information = yield* stage({
        target: '/api/upload/cloud/info/v2',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          md5: songFile.md5,
          songid: check.songId,
          filename: songFile.name,
          song: tags.title || filename,
          album: tags.album || '未知专辑',
          artist: tags.artist || '未知艺术家',
          bitrate: '999000',
          resourceId: token.resourceId,
        }),
        response: 'json',
        semantic: 'upload',
      });
      const info = yield* Schema.decodeUnknownEffect(
        Schema.Struct({ songId: Schema.Union([Schema.String, Schema.Finite]) }),
      )(information.body).pipe(
        Effect.mapError(
          () =>
            new UnexpectedUpstreamShape({
              module: 'cloud',
              path: 'songId',
              expected: 'song identifier',
              actual: typeof information.body,
            }),
        ),
      );
      const published = yield* stage({
        target: '/api/cloud/pub/v2',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({ songid: info.songId }),
        response: 'json',
        semantic: 'upload',
      });
      if (!isRecord(published.body)) {
        return yield* new UnexpectedUpstreamShape({
          module: 'cloud',
          path: 'body',
          expected: 'object',
          actual: typeof published.body,
        });
      }
      if (!isRecord(checked.body)) {
        return yield* new UnexpectedUpstreamShape({
          module: 'cloud',
          path: 'body',
          expected: 'object',
          actual: typeof checked.body,
        });
      }
      return {
        status: 200,
        cookie: [...checked.cookie],
        body: {
          ...checked.body,
          ...published.body,
        },
      };
    }),
  );

export default cloud;
