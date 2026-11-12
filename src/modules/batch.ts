import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/batch',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type BatchSubRequest = Record<string, unknown>;

export type BatchRouteKey = `/api/${string}`;

export type ModuleInput = Partial<Record<string, unknown>>;

const inputSchema = Schema.Record(Schema.String, Schema.Unknown);

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(
    Effect.flatMap((query) => {
      for (const [route, parameters] of Object.entries(query)) {
        if (
          route.startsWith('/api/') &&
          parameters !== undefined &&
          !isRecord(parameters)
        ) {
          return Effect.fail(
            InvalidModuleInput.make({
              message: `${route} must be an object`,
            }),
          );
        }
      }
      return Effect.succeed(query);
    }),
  );

const batch: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {};
    for (const [route, parameters] of Object.entries(query)) {
      if (route.startsWith('/api/')) {
        data[route] = parameters;
      }
    }
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 批量请求接口
 */
export default batch;
