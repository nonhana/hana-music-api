import { randomUUID } from 'node:crypto';

import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  LegacyUploadedFile,
  QueryBooleanLike,
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryBoolean,
  QueryNumber,
  UploadedFile,
} from './_input.ts';
import {
  createMultipartCompleteXml,
  parseMultipartUploadId,
} from './voice_upload/multipart_xml.ts';

export type ModuleInput = {
  autoPublish?: QueryBooleanLike;
  autoPublishText?: string;
  categoryId?: QueryIdentifier;
  composedSongs?: string;
  coverImgId?: QueryIdentifier;
  description?: string;
  orderNo?: QueryNumberLike;
  privacy?: QueryBooleanLike;
  publishTime?: QueryNumberLike;
  secondCategoryId?: QueryIdentifier;
  songFile?: LegacyUploadedFile;
  songName?: string;
  voiceListId?: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  autoPublish: Schema.optional(QueryBoolean),
  autoPublishText: Schema.optional(Schema.String),
  categoryId: Schema.optional(Identifier),
  composedSongs: Schema.optional(Schema.String),
  coverImgId: Schema.optional(Identifier),
  description: Schema.optional(Schema.String),
  orderNo: Schema.optional(QueryNumber),
  privacy: Schema.optional(QueryBoolean),
  publishTime: Schema.optional(QueryNumber),
  secondCategoryId: Schema.optional(Identifier),
  songFile: Schema.optional(UploadedFile),
  songName: Schema.optional(Schema.String),
  voiceListId: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const voiceUpload: ModuleEffect<ModuleInput> = (input, request) =>
  uploadWork('voice_upload', request, (stage) =>
    Effect.gen(function* () {
      if (!input.songFile) {
        return yield* Effect.fail(
          new InvalidModuleInput({ message: '请上传音频文件', status: 500 }),
        );
      }
      const call = yield* Call;
      const ext = input.songFile.name.includes('flac') ? 'flac' : 'mp3';
      const filename =
        input.songName ||
        input.songFile.name
          .replace('.' + ext, '')
          .replace(/\s/g, '')
          .replace(/\./g, '_');
      const allocation = yield* stage({
        target: '/api/nos/token/alloc',
        protocol: call.config.crypto || 'weapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          bucket: 'ymusic',
          ext,
          filename,
          local: false,
          nos_product: 0,
          type: 'other',
        }),
        response: 'json',
        semantic: 'upload',
      });
      const { result: token } = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          result: Schema.Struct({
            docId: Schema.Union([Schema.String, Schema.Number]),
            objectKey: Schema.String,
            token: Schema.String,
          }),
        }),
      )(allocation.body).pipe(
        Effect.mapError(
          () =>
            new UnexpectedUpstreamShape({
              module: 'voice_upload',
              path: 'result',
              expected: 'docId, objectKey and token',
              actual: typeof allocation.body,
            }),
        ),
      );
      const objectKey = encodeURIComponent(token.objectKey);
      const base = `https://ymusic.nos-hz.163yun.com/${objectKey}`;
      const initialized = yield* stage({
        target: `${base}?uploads`,
        protocol: 'plain',
        method: 'POST',
        headers: {
          'x-nos-token': token.token,
          'X-Nos-Meta-Content-Type': 'audio/mpeg',
        },
        response: 'text',
        semantic: 'upload',
      });
      const uploadId = encodeURIComponent(
        yield* parseMultipartUploadId(initialized.body),
      );
      const bytes =
        input.songFile.data instanceof ArrayBuffer
          ? new Uint8Array(input.songFile.data)
          : input.songFile.data;
      const blockSize = 10 * 1024 * 1024;
      const etags: Array<string> = [];
      for (let offset = 0; offset < bytes.byteLength; offset += blockSize) {
        const part = yield* stage({
          target: `${base}?partNumber=${etags.length + 1}&uploadId=${uploadId}`,
          protocol: 'plain',
          method: 'PUT',
          headers: { 'x-nos-token': token.token, 'Content-Type': 'audio/mpeg' },
          body: bytes.subarray(
            offset,
            Math.min(offset + blockSize, bytes.byteLength),
          ),
          response: 'bytes',
          semantic: 'upload',
        });
        etags.push(part.headers.get('etag') ?? '');
      }
      yield* stage({
        target: `${base}?uploadId=${uploadId}`,
        protocol: 'plain',
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'X-Nos-Meta-Content-Type': 'audio/mpeg',
          'x-nos-token': token.token,
        },
        body: createMultipartCompleteXml(etags),
        response: 'bytes',
        semantic: 'upload',
      });
      const voiceData = JSON.stringify([
        {
          name: filename,
          autoPublish: Number(input.autoPublish) === 1,
          autoPublishText: input.autoPublishText || '',
          description: input.description,
          voiceListId: input.voiceListId,
          coverImgId: input.coverImgId,
          dfsId: token.docId,
          categoryId: input.categoryId,
          secondCategoryId: input.secondCategoryId,
          composedSongs: input.composedSongs
            ? input.composedSongs.split(',')
            : [],
          privacy: Number(input.privacy) === 1,
          publishTime: input.publishTime || 0,
          orderNo: input.orderNo || 1,
        },
      ]);
      yield* stage({
        target: '/api/voice/workbench/voice/batch/upload/preCheck',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: { 'x-nos-token': token.token },
        body: JSON.stringify({ dupkey: randomUUID(), voiceData }),
        response: 'json',
        semantic: 'upload',
      });
      const submitted = yield* stage({
        target: '/api/voice/workbench/voice/batch/upload/v2',
        protocol: call.config.crypto || 'eapi',
        method: 'POST',
        headers: { 'x-nos-token': token.token },
        body: JSON.stringify({ dupkey: randomUUID(), voiceData }),
        response: 'json',
        semantic: 'upload',
      });
      if (!isRecord(submitted.body)) {
        return yield* Effect.fail(
          new UnexpectedUpstreamShape({
            module: 'voice_upload',
            path: 'body',
            expected: 'object',
            actual: typeof submitted.body,
          }),
        );
      }
      return {
        status: 200,
        cookie: [],
        body: {
          code: 200,
          ...('data' in submitted.body ? { data: submitted.body.data } : {}),
        },
      };
    }),
  );

export default voiceUpload;
