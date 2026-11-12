import { randomUUID } from 'node:crypto';

import { Effect, Schema } from 'effect';

import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  BooleanValue,
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
  UploadedFile,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { uploadWork } from '../core/upload-work.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  allocate: {
    profile: 'web',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  initialize: {
    profile: 'plainVoice',
    target: { prefix: '/' },
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'POST',
    response: 'text',
  },
  part: {
    profile: 'plainVoice',
    target: { prefix: '/' },
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'PUT',
    response: 'bytes',
  },
  complete: {
    profile: 'plainVoice',
    target: { prefix: '/' },
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'POST',
    response: 'bytes',
  },
  preCheck: {
    profile: 'eapi',
    target: '/api/voice/workbench/voice/batch/upload/preCheck',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  submit: {
    profile: 'eapi',
    target: '/api/voice/workbench/voice/batch/upload/v2',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  autoPublish?: boolean;
  autoPublishText?: string;
  categoryId?: NumberId;
  composedSongs?: ReadonlyArray<NumberId> | string;
  coverImgId?: NumberId;
  description?: string;
  orderNo?: NaturalValue;
  privacy?: boolean;
  publishTime?: NaturalValue;
  secondCategoryId?: NumberId;
  songFile?: typeof UploadedFile.Type;
  songName?: string;
  voiceListId?: NumberId;
};

const inputSchema = Schema.Struct({
  autoPublish: Schema.optional(BooleanValue),
  autoPublishText: Schema.optional(Schema.String),
  categoryId: Schema.optional(NumberId),
  composedSongs: Schema.optional(
    Schema.Union([Schema.Array(NumberId), Schema.String]),
  ),
  coverImgId: Schema.optional(NumberId),
  description: Schema.optional(Schema.String),
  orderNo: Schema.optional(NaturalValue),
  privacy: Schema.optional(BooleanValue),
  publishTime: Schema.optional(NaturalValue),
  secondCategoryId: Schema.optional(NumberId),
  songFile: Schema.optional(UploadedFile),
  songName: Schema.optional(Schema.String),
  voiceListId: Schema.optional(NumberId),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const parseMultipartUploadId = (xml: unknown) => {
  const uploadId =
    typeof xml === 'string'
      ? xml.match(/<UploadId>([^<]+)<\/UploadId>/iu)?.[1]?.trim()
      : undefined;
  return uploadId
    ? Effect.succeed(uploadId)
    : Effect.fail(
        UnexpectedUpstreamShape.make({
          module: 'voice_upload',
          path: 'UploadId',
          expected: 'non-empty XML UploadId',
          actual: typeof xml,
        }),
      );
};

export const createMultipartCompleteXml = (
  etags: ReadonlyArray<string>,
): string => {
  const parts = etags
    .map(
      (etag, index) =>
        `<Part><PartNumber>${index + 1}</PartNumber><ETag>${etag}</ETag></Part>`,
    )
    .join('');
  return `<CompleteMultipartUpload>${parts}</CompleteMultipartUpload>`;
};

const voiceUpload: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  uploadWork('voice_upload', request, (stage) =>
    Effect.gen(function* () {
      if (!input.songFile) {
        return yield* InvalidModuleInput.make({
          message: '请上传音频文件',
          status: 500,
        });
      }
      const ext = input.songFile.name.includes('flac') ? 'flac' : 'mp3';
      const filename =
        input.songName ||
        input.songFile.name
          .replace('.' + ext, '')
          .replace(/\s/g, '')
          .replace(/\./g, '_');
      const allocation = yield* stage('allocate', {
        data: {
          bucket: 'ymusic',
          ext,
          filename,
          local: false,
          nos_product: 0,
          type: 'other',
        },
      });
      const { result: token } = yield* Schema.decodeUnknownEffect(
        Schema.Struct({
          result: Schema.Struct({
            docId: Schema.Union([Schema.String, Schema.Finite]),
            objectKey: Schema.String,
            token: Schema.String,
          }),
        }),
      )(allocation.body).pipe(
        Effect.mapError(() =>
          UnexpectedUpstreamShape.make({
            module: 'voice_upload',
            path: 'result',
            expected: 'docId, objectKey and token',
            actual: typeof allocation.body,
          }),
        ),
      );
      const objectKey = encodeURIComponent(token.objectKey);
      const base = `https://ymusic.nos-hz.163yun.com/${objectKey}`;
      const initialized = yield* stage('initialize', {
        target: `${base}?uploads`,
        headers: {
          'x-nos-token': token.token,
          'X-Nos-Meta-Content-Type': 'audio/mpeg',
        },
      });
      const parsedUploadId = yield* parseMultipartUploadId(initialized.body);
      const uploadId = encodeURIComponent(parsedUploadId);
      const bytes =
        input.songFile.data instanceof ArrayBuffer
          ? new Uint8Array(input.songFile.data)
          : input.songFile.data;
      const blockSize = 10 * 1024 * 1024;
      const etags: Array<string> = [];
      for (let offset = 0; offset < bytes.byteLength; offset += blockSize) {
        const part = yield* stage('part', {
          target: `${base}?partNumber=${etags.length + 1}&uploadId=${uploadId}`,
          headers: {
            'x-nos-token': token.token,
            'Content-Type': 'audio/mpeg',
          },
          body: bytes.subarray(
            offset,
            Math.min(offset + blockSize, bytes.byteLength),
          ),
        });
        etags.push(part.headers.get('etag') ?? '');
      }
      yield* stage('complete', {
        target: `${base}?uploadId=${uploadId}`,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'X-Nos-Meta-Content-Type': 'audio/mpeg',
          'x-nos-token': token.token,
        },
        body: createMultipartCompleteXml(etags),
      });
      const composedSongs =
        typeof input.composedSongs === 'string'
          ? input.composedSongs
            ? input.composedSongs.split(',')
            : []
          : (input.composedSongs ?? []);
      const voiceData = JSON.stringify([
        {
          name: filename,
          autoPublish: input.autoPublish === true,
          autoPublishText: input.autoPublishText || '',
          description: input.description,
          voiceListId: input.voiceListId,
          coverImgId: input.coverImgId,
          dfsId: token.docId,
          categoryId: input.categoryId,
          secondCategoryId: input.secondCategoryId,
          composedSongs: composedSongs.map(String),
          privacy: input.privacy === true,
          publishTime: input.publishTime || 0,
          orderNo: input.orderNo || 1,
        },
      ]);
      yield* stage('preCheck', {
        data: { dupkey: randomUUID(), voiceData },
        headers: { 'x-nos-token': token.token },
      });
      const submitted = yield* stage('submit', {
        data: { dupkey: randomUUID(), voiceData },
        headers: { 'x-nos-token': token.token },
      });
      if (!isRecord(submitted.body)) {
        return yield* UnexpectedUpstreamShape.make({
          module: 'voice_upload',
          path: 'body',
          expected: 'object',
          actual: typeof submitted.body,
        });
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
