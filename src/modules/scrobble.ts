import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  source?: string;
  // 没有容器 id 的来源传 0，文档明确允许；因此不能用拒绝 0 的 NumberId。
  sourceid: number;
  time?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  source: Schema.optional(Schema.String),
  sourceid: NaturalValue,
  time: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  start: {
    profile: 'clientlogOsx',
    target: '/api/feedback/weblog',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  play: {
    profile: 'clientlogOsx',
    target: '/api/feedback/weblog',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 返回 200 不代表计入了听歌排行（验证关卡①实测没有计入，见 nonhana/hana-music-api#31）。
// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.String),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const scrobble: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const source = query.source ?? 'list';
    yield* request('start', {
      data: {
        logs: JSON.stringify([
          {
            action: 'startplay',
            json: {
              id: query.id,
              type: 'song',
              mainsite: '1',
              mainsiteWeb: '1',
              content: `id=${String(query.sourceid)}`,
            },
          },
        ]),
      },
    });
    const response = yield* request('play', {
      data: {
        logs: JSON.stringify([
          {
            action: 'play',
            json: {
              download: 0,
              end: 'playend',
              id: query.id,
              sourceId: query.sourceid,
              time: query.time,
              type: 'song',
              wifi: 0,
              source,
              mainsite: '1',
              mainsiteWeb: '1',
              content: `id=${String(query.sourceid)}`,
            },
          },
        ]),
      },
    });
    const body = yield* decodeUpstreamBody('scrobble', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 听歌打卡
 */
export default scrobble;
