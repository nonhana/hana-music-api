import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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
      buildApiRequestIntent(
        `/api/ordering/web/digital`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return toModuleResponse(response);
  });

/**
 * 购买数字专辑
 */
export default digitalAlbumOrdering;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
