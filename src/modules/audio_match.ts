import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';
import { decodeModuleInput as decodeInput, QueryNumber } from './_input.ts';

export type ModuleInput = {
  audioFP: string;
  duration: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  audioFP: Schema.String,
  duration: QueryNumber,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const audioMatch: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const response = yield* request({
      target: `https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=${input.duration}&rawdata=${encodeURIComponent(input.audioFP)}&times=1&decrypt=1`,
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'json',
      semantic: 'read',
    });
    if (!isRecord(response.body)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'audio_match',
        path: 'body',
        expected: 'object',
        actual: typeof response.body,
      });
    }
    return {
      status: 200,
      cookie: [],
      body: {
        code: typeof response.body.code === 'number' ? response.body.code : 200,
        ...('data' in response.body ? { data: response.body.data } : {}),
        ...(typeof response.body.message === 'string'
          ? { message: response.body.message }
          : {}),
      },
    };
  });

export default audioMatch;
