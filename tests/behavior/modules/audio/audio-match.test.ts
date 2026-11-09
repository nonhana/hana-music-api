// cspell:words shazam
import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import audioMatch from '../../../../src/modules/audio_match.ts';
import { runEffect } from '../../../_kit/it.ts';
import type { RecordedAction } from '../../../_kit/module.ts';
import { executeModule, response } from '../../../_kit/upload.ts';

test('audio matching emits a plain read intent and preserves arbitrary data', async () => {
  const intents: Array<RecordedAction> = [];
  const data = {
    result: [{ song: { id: 123, album: { name: 'Album' } } }],
    future: [null, true],
  };
  const result = await runEffect(
    executeModule(
      audioMatch,
      { audioFP: 'fp&value', duration: 3 },
      (action, args) => {
        const intent = { action, args };
        return Effect.sync(() => {
          intents.push(intent);
          return response({ code: 200, data, message: '' });
        });
      },
    ),
  );
  expect(result).toEqual({
    status: 200,
    cookie: [],
    body: { code: 200, data, message: '' },
  });
  expect(intents).toEqual([
    {
      action: 'match',
      args: {
        query:
          'sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=3&rawdata=fp%26value&times=1&decrypt=1',
      },
    },
  ]);
});

test('audio matching rejects a non-object response with a typed shape error', async () => {
  const error = await runEffect(
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
