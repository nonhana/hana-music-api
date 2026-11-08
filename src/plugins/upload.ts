import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import {
  buildActionRequestIntent,
  buildPlainActionRequestIntent,
} from '../core/request-intent.ts';
import type { ModuleInput as UploadImageQuery } from '../modules/avatar_upload.ts';
import type { RequestCapability } from '../types/index.ts';

export const imageUploadActions = {
  imageAllocate: {
    profile: 'web',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  imageUpload: {
    profile: 'plainImage',
    target: { prefix: '/yyimgs/' },
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'POST',
    response: 'bytes',
  },
} as const satisfies ModuleActions;

// 上传地址和凭证不绑定本进程，可以交给浏览器直传；imgId 在上传完成后才能设为封面。
export const allocateImageUpload = (
  filename: string,
  request: RequestCapability,
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const allocation = yield* request(
      buildActionRequestIntent(
        'imageAllocate',
        imageUploadActions.imageAllocate,
        {
          bucket: 'yyimgs',
          ext: 'jpg',
          filename,
          local: false,
          nos_product: 0,
          return_body: '{"code":200,"size":"$(ObjectSize)"}',
          type: 'other',
        },
      ),
    );
    const { result: token } = yield* Schema.decodeUnknownEffect(
      Schema.Struct({
        result: Schema.Struct({
          objectKey: Schema.String,
          token: Schema.String,
          docId: Schema.Union([Schema.String, Schema.Finite]),
        }),
      }),
    )(allocation.body).pipe(
      Effect.mapError(() =>
        UnexpectedUpstreamShape.make({
          module: call.identifier,
          path: 'result',
          expected: 'objectKey, token and docId',
          actual: typeof allocation.body,
        }),
      ),
    );
    return {
      imgId: token.docId,
      token: token.token,
      uploadUrl: `https://nosup-hz1.127.net/yyimgs/${token.objectKey}?offset=0&complete=true&version=1.0`,
      url_pre: 'https://p1.music.126.net/' + token.objectKey,
    };
  });

export default (input: UploadImageQuery, request: RequestCapability) =>
  Effect.gen(function* () {
    if (!input.imgFile) {
      return yield* InvalidModuleInput.make({
        message: 'imgFile is required for upload plugin',
        status: 502,
      });
    }
    const allocation = yield* allocateImageUpload(input.imgFile.name, request);
    yield* request(
      buildPlainActionRequestIntent(
        'imageUpload',
        imageUploadActions.imageUpload,
        allocation.uploadUrl,
        {
          headers: {
            'x-nos-token': allocation.token,
            'Content-Type': 'image/jpeg',
          },
          body:
            input.imgFile.data instanceof ArrayBuffer
              ? new Uint8Array(input.imgFile.data)
              : input.imgFile.data,
        },
      ),
    );
    return { url_pre: allocation.url_pre, imgId: allocation.imgId };
  });
