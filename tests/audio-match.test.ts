import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import audioMatch from '../src/modules/audio_match.ts';
import type { RequestIntent } from '../src/types/index.ts';
import { executeModule, response } from './fixtures/upload-effect.ts';

test('audio matching emits a plain read intent and preserves arbitrary data', async () => {
  const intents: Array<RequestIntent> = [];
  const data = {
    result: [{ song: { id: 123, album: { name: 'Album' } } }],
    future: [null, true],
  };
  const result = await Effect.runPromise(
    executeModule(audioMatch, { audioFP: 'fp&value', duration: 3 }, (intent) =>
      Effect.sync(() => {
        intents.push(intent);
        return response({ code: 200, data, message: '' });
      }),
    ),
  );
  expect(result).toEqual({
    status: 200,
    cookie: [],
    body: { code: 200, data, message: '' },
  });
  expect(intents).toEqual([
    {
      target:
        'https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=3&rawdata=fp%26value&times=1&decrypt=1',
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'json',
      semantic: 'read',
    },
  ]);
});

test('audio matching rejects a non-object response with a typed shape error', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      executeModule(audioMatch, { audioFP: 'fp', duration: 3 }, () =>
        Effect.succeed(response(null)),
      ),
    ),
  );
  expect(error).toMatchObject({
    _tag: 'UnexpectedUpstreamShape',
    module: 'audio_match',
  });
});
