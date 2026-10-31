import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import {
  decodeUpstreamBody,
  kindOf,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { SongUrlData } from '../core/upstream-schemas.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect, UnknownJson } from '../types/index.ts';
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

// 继承共享的播放/下载地址条目，仅放宽 id：兼容旧实现接受的字符串 id；本批录制里都是数字。
const SongUrlEntry = UpstreamObject({
  ...SongUrlData.schema.fields,
  id: Schema.Union([Schema.String, Schema.Finite]),
});

// 通到播放地址的路径 `data`、每一项的 `id` / `url` / `code` 收紧；其余字段宽松。
// 这是 SDK 最终体：上游顶层 code 被忽略，模块合成 `code: 200`；上游 `data` 数组按请求 id
// 顺序重排，其他顶层字段丢弃。单项失败看 `data[].code`。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SongUrlEntry),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songUrl: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const ids = String(query.id).split(',');
    const response = yield* request(
      buildApiRequestIntent(
        '/api/song/enhance/player/url',
        {
          ids: JSON.stringify(ids),
          br: parseInt(String(query.br ?? 999000), 10),
        },
        createOption(query),
      ),
    );
    const upstream = response.body;
    if (!isRecord(upstream)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'song_url',
        path: 'body.data',
        expected: 'array',
        actual: kindOf(upstream),
      });
    }
    const data = upstream.data;
    if (data !== undefined && !Array.isArray(data)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'song_url',
        path: 'body.data',
        expected: 'array',
        actual: kindOf(data),
      });
    }
    const order = new Map<string, number>();
    ids.forEach((id, index) => {
      if (!order.has(id)) {
        order.set(id, index);
      }
    });
    const rank = (id: unknown) =>
      typeof id === 'string' || typeof id === 'number'
        ? (order.get(String(id)) ?? -1)
        : -1;
    const entries: ReadonlyArray<UnknownJson> = data ?? [];
    const ordered = entries
      .map((value) => ({
        id: isRecord(value) ? value.id : undefined,
        value,
      }))
      .toSorted((left, right) => rank(left.id) - rank(right.id))
      .map(({ value }) => value);
    const body = yield* decodeUpstreamBody('song_url', ModuleBody, {
      ...response,
      body: { code: 200, data: ordered },
    });
    return { status: 200, cookie: [], body };
  });

export default songUrl;
