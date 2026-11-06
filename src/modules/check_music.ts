import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  kindOf,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  br?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  br: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 上游只读取 `data[0].code` 判断能否播放；`data[1..]` 和条目里的其他字段不校验、不参与公开体。
const upstreamSchema = UpstreamObject({
  code: Schema.Literal(200),
  data: Schema.Array(Schema.Unknown),
});

// 返回码和是否可播放 `success` 收紧：`success` 由上游 `data[0].code` 是否 200 得出，是接口要拿的那一项；
// 返回体由 SDK 拼出，`message` 是固定文案。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Struct({
    code: Schema.Literal(200),
    success: Schema.Boolean,
    message: Schema.String,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const checkMusic: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        '/api/song/enhance/player/url',
        {
          ids: '[' + parseInt(String(query.id ?? 0), 10) + ']',
          br: parseInt(String(query.br ?? 999000), 10),
        },
        createOption(query, 'weapi'),
      ),
    );
    const upstream = yield* decodeUpstreamBody(
      'check_music',
      upstreamSchema,
      response,
    );
    const [first] = upstream.data;
    if (first !== undefined && !isRecord(first)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.data[0]',
        expected: 'object',
        actual: kindOf(first),
      });
    }
    if (first !== undefined && !('code' in first)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.data[0].code',
        expected: 'present',
        actual: 'missing',
      });
    }
    if (first !== undefined && typeof first.code !== 'number') {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.data[0].code',
        expected: 'number',
        actual: kindOf(first.code),
      });
    }
    const playable = first !== undefined && first.code === 200;
    return {
      ...toModuleResponse(response),
      body: {
        code: 200 as const,
        success: playable,
        message: playable ? 'ok' : '亲爱的,暂无版权',
      },
    };
  });

export default checkMusic;
