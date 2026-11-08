import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';
import * as metadata from 'music-metadata';

import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  UploadedFile,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import uploadSongPlugin, { songUploadActions } from '../plugins/song-upload.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/module-shared.ts';

export const moduleActions = {
  ...songUploadActions,
  check: {
    profile: 'eapi',
    target: '/api/cloud/upload/check',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  allocate: {
    profile: 'eapi',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  information: {
    profile: 'eapi',
    target: '/api/upload/cloud/info/v2',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  publish: {
    profile: 'eapi',
    target: '/api/cloud/pub/v2',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

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
        return yield* InvalidModuleInput.make({
          message: '请上传音乐文件',
          status: 500,
        });
      }
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
      const checked = yield* stage(
        buildActionRequestIntent('check', moduleActions.check, {
          bitrate: '999000',
          ext: '',
          length: songFile.size,
          md5: songFile.md5,
          songId: '0',
          version: 1,
        }),
      );
      const check = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          needUpload: Schema.Boolean,
          songId: Schema.Union([Schema.String, Schema.Finite]),
        }),
      )(checked.body).pipe(
        Effect.mapError(() =>
          UnexpectedUpstreamShape.make({
            module: 'cloud',
            path: 'body',
            expected: 'needUpload and songId',
            actual: typeof checked.body,
          }),
        ),
      );
      const tags = yield* Effect.tryPromise({
        try: () => metadata.parseBuffer(bytes, songFile.mimetype),
        catch: () =>
          InvalidModuleInput.make({ message: '无法读取音乐文件元数据' }),
      }).pipe(
        Effect.map((info) => info.common),
        Effect.orElseSucceed(() => ({ title: '', album: '', artist: '' })),
      );
      const allocation = yield* stage(
        buildActionRequestIntent('allocate', moduleActions.allocate, {
          bucket: '',
          ext,
          filename,
          local: false,
          nos_product: 3,
          type: 'audio',
          md5: songFile.md5,
        }),
      );
      const { result: token } = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          result: Schema.Struct({
            resourceId: Schema.Union([Schema.String, Schema.Finite]),
          }),
        }),
      )(allocation.body).pipe(
        Effect.mapError(() =>
          UnexpectedUpstreamShape.make({
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
      const information = yield* stage(
        buildActionRequestIntent('information', moduleActions.information, {
          md5: songFile.md5,
          songid: check.songId,
          filename: songFile.name,
          song: tags.title || filename,
          album: tags.album || '未知专辑',
          artist: tags.artist || '未知艺术家',
          bitrate: '999000',
          resourceId: token.resourceId,
        }),
      );
      const info = yield* Schema.decodeUnknownEffect(
        Schema.Struct({ songId: Schema.Union([Schema.String, Schema.Finite]) }),
      )(information.body).pipe(
        Effect.mapError(() =>
          UnexpectedUpstreamShape.make({
            module: 'cloud',
            path: 'songId',
            expected: 'song identifier',
            actual: typeof information.body,
          }),
        ),
      );
      const published = yield* stage(
        buildActionRequestIntent('publish', moduleActions.publish, {
          songid: info.songId,
        }),
      );
      if (!isRecord(published.body)) {
        return yield* UnexpectedUpstreamShape.make({
          module: 'cloud',
          path: 'body',
          expected: 'object',
          actual: typeof published.body,
        });
      }
      if (!isRecord(checked.body)) {
        return yield* UnexpectedUpstreamShape.make({
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
