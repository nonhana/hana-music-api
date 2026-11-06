import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  LegacyInput,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';

export type BatchSubRequest = Record<string, unknown>;

export type BatchRouteKey = `/api/${string}`;

export type ModuleInput = Partial<Record<BatchRouteKey, BatchSubRequest>>;

const inputSchema = Schema.Record(
  Schema.TemplateLiteral(['/api/', Schema.String]),
  Schema.UndefinedOr(LegacyInput),
);

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const batch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {};
    Object.entries(query).forEach(([route, parameters]) => {
      if (route.startsWith('/api/')) {
        data[route] = parameters;
      }
    });
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/batch`, data, createOption(query)),
      ),
    );
  });

/**
 * 批量请求接口
 */
export default batch;
