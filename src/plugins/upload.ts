import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { InvalidModuleInput, UnexpectedUpstreamShape } from '../core/errors.ts';
import type { ModuleInput as UploadImageQuery } from '../modules/avatar_upload.ts';
import type { RequestCapability } from '../types/index.ts';

export default (input: UploadImageQuery, request: RequestCapability) =>
  Effect.gen(function* () {
    if (!input.imgFile) {
      return yield* new InvalidModuleInput({
        message: 'imgFile is required for upload plugin',
        status: 502,
      });
    }
    const call = yield* Call;
    const allocation = yield* request({
      target: '/api/nos/token/alloc',
      protocol: call.config.crypto || 'weapi',
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        bucket: 'yyimgs',
        ext: 'jpg',
        filename: input.imgFile.name,
        local: false,
        nos_product: 0,
        return_body: '{"code":200,"size":"$(ObjectSize)"}',
        type: 'other',
      }),
      response: 'json',
      semantic: 'upload',
    });
    const { result: token } = yield* Schema.decodeUnknownEffect(
      Schema.Struct({
        result: Schema.Struct({
          objectKey: Schema.String,
          token: Schema.String,
          docId: Schema.Union([Schema.String, Schema.Finite]),
        }),
      }),
    )(allocation.body).pipe(
      Effect.mapError(
        () =>
          new UnexpectedUpstreamShape({
            module: call.identifier,
            path: 'result',
            expected: 'objectKey, token and docId',
            actual: typeof allocation.body,
          }),
      ),
    );
    yield* request({
      target: `https://nosup-hz1.127.net/yyimgs/${token.objectKey}?offset=0&complete=true&version=1.0`,
      protocol: 'plain',
      method: 'POST',
      headers: { 'x-nos-token': token.token, 'Content-Type': 'image/jpeg' },
      body:
        input.imgFile.data instanceof ArrayBuffer
          ? new Uint8Array(input.imgFile.data)
          : input.imgFile.data,
      response: 'bytes',
      semantic: 'upload',
    });
    return {
      url_pre: 'https://p1.music.126.net/' + token.objectKey,
      imgId: token.docId,
    };
  });
