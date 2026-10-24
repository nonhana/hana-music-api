import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;

  type?: 0 | 1 | '0' | '1';
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  type: Schema.optional(Schema.Literals([0, 1, '0', '1'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// `type` 决定返回 `allData` 还是 `weekData`，两个列表都可以没有；列表存在时按记录结构校验。
const RecordSong = UpstreamObject({
  ...Song.schema.fields,
  id: Loose(Schema.Finite),
});

const PlayRecord = UpstreamObject({
  playCount: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  song: RecordSong,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    allData: Optional(Schema.Array(PlayRecord)),
    weekData: Optional(Schema.Array(PlayRecord)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userRecord: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      uid: query.uid,
      type: query.type || 0, // 1: 最近一周, 0: 所有时间
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/play/record`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('user_record', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌排行
 */
export default userRecord;
