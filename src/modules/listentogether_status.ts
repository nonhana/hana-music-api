import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/listen/together/status/get',
    semantic: 'poll',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const TogetherStatus = UpstreamObject({
  inRoom: Schema.Boolean,
  anotherFollowStatus: Loose(Schema.Boolean),
});

// 通到一起听状态的 `data` 和接口就是为了拿的 `data.inRoom` 收紧；`roomInfo`、`anotherDeviceInfo`
// 和 `data.status` 在录制里只见过 `null`，不声明，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: TogetherStatus,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherStatus: ModuleEffect<ModuleInput, ModuleBody> = (
  _query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], {}),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_status',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听状态
 */
export default listentogetherStatus;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
