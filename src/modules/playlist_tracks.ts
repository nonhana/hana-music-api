import { Effect, Schema } from 'effect';

import {
  InvalidModuleInput,
  ProtocolFailed,
  UpstreamBusinessFailed,
} from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Schema.Finite,
    cloudCount: Schema.Finite,
    trackIds: Schema.optionalKey(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const decodeResponse = (response: Parameters<typeof toModuleResponse>[0]) => {
  const body =
    typeof response.body === 'object' &&
    response.body !== null &&
    'body' in response.body &&
    typeof response.body.body === 'object' &&
    response.body.body !== null
      ? response.body.body
      : response.body;
  const normalized = { ...response, body };
  return decodeUpstreamBody('playlist_tracks', ModuleBody, normalized).pipe(
    Effect.map((decoded) => ({
      ...toModuleResponse(normalized),
      body: decoded,
    })),
  );
};

const playlistTracks: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
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
      Effect.flatMap(decodeResponse),
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
          return yield* request(
            buildApiRequestIntent(
              '/api/playlist/manipulate/tracks',
              { ...data, trackIds: JSON.stringify([...tracks, ...tracks]) },
              createOption(query),
            ),
          ).pipe(Effect.flatMap(decodeResponse));
        }),
      ),
    );
  });

export default playlistTracks;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
