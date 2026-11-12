import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export type ModuleInput = {
  id: NumberId;
  payment: string;
  quantity: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  payment: Schema.String,
  quantity: NaturalValue,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/ordering/web/digital',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const digitalAlbumOrdering: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      business: 'Album',
      paymentMethod: query.payment,
      digitalResources: JSON.stringify([
        {
          business: 'Album',
          resourceID: String(query.id),
          quantity: query.quantity,
        },
      ]),
      from: 'web',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 购买数字专辑
 */
export default digitalAlbumOrdering;
