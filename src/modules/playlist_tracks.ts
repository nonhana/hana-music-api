import { Effect } from 'effect';

import {
  InvalidModuleInput,
  ProtocolFailed,
  UpstreamBusinessFailed,
} from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistTracks: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.tracks !== undefined &&
      query.tracks !== null &&
      typeof query.tracks !== 'string' &&
      typeof query.tracks !== 'number' &&
      typeof query.tracks !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'tracks must be a primitive value',
      });
    }
    const tracks = String(query.tracks ?? '').split(',');
    const data = {
      op: query.op,
      pid: query.pid,
      trackIds: JSON.stringify(tracks),
      imme: 'true',
    };
    return yield* request(
      buildApiRequestIntent(
        '/api/playlist/manipulate/tracks',
        data,
        createOption(query),
      ),
    ).pipe(
      Effect.map((response) => ({
        status: 200,
        cookie: [],
        body: { ...toModuleResponse(response) },
      })),
      Effect.mapError((error) => {
        if (error instanceof ProtocolFailed && error.response) {
          const body = error.response.body;
          if (
            body !== null &&
            typeof body === 'object' &&
            !Array.isArray(body) &&
            typeof body.code === 'number' &&
            Number.isFinite(body.code)
          ) {
            return new UpstreamBusinessFailed({
              message: error.message,
              code: body.code,
              response: error.response,
            });
          }
        }
        return error;
      }),
      Effect.catchTag('UpstreamBusinessFailed', (error) =>
        Effect.gen(function* () {
          if (error.code !== 512) {
            return yield* error;
          }
          return toModuleResponse(
            yield* request(
              buildApiRequestIntent(
                '/api/playlist/manipulate/tracks',
                { ...data, trackIds: JSON.stringify([...tracks, ...tracks]) },
                createOption(query),
              ),
            ),
          );
        }),
      ),
    );
  });

export default playlistTracks;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
