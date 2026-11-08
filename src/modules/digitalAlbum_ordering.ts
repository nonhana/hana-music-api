import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/ordering/web/digital',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const digitalAlbumOrdering: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      business: 'Album',
      paymentMethod: query.payment,
      digitalResources: JSON.stringify([
        {
          business: 'Album',
          resourceID: query.id,
          quantity: query.quantity,
        },
      ]),
      from: 'web',
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    return toModuleResponse(response);
  });

/**
 * 购买数字专辑
 */
export default digitalAlbumOrdering;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
