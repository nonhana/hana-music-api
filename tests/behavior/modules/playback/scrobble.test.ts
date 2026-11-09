import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { Call } from '../../../../src/core/call-context.ts';
import type { CallShape } from '../../../../src/core/call-context.ts';
import { resolveIdentitySnapshot } from '../../../../src/core/identity.ts';
import { getRuntimeState } from '../../../../src/core/runtime.ts';
import scrobble from '../../../../src/modules/scrobble.ts';
import type { ModuleInput } from '../../../../src/modules/scrobble.ts';
import type { RequestCapability } from '../../../../src/types/index.ts';
import { provideService, runEffect } from '../../../_kit/it.ts';
import type { RecordedAction } from '../../../_kit/module.ts';

const response = {
  body: { code: 200, data: 'success' },
  cookie: [],
  headers: new Headers(),
  status: 200,
};

const call: CallShape = {
  actions: {},
  identity: resolveIdentitySnapshot({}, getRuntimeState()),
  identifier: 'scrobble',
  input: {},
  policy: { read: false, upload: false },
};

const captureRequests = () => {
  const intents: Array<RecordedAction> = [];
  const request: RequestCapability = (action, args) => {
    const intent = { action, args };
    return Effect.sync(() => {
      intents.push(intent);
      return response;
    });
  };
  return { intents, request };
};

const runScrobble = (input: ModuleInput, request: RequestCapability) =>
  runEffect(provideService(scrobble(input, request), Call, call));

test('scrobble submits startplay and play logs with the selected source', async () => {
  const { intents, request } = captureRequests();

  await runScrobble(
    {
      id: 22712179,
      source: 'album',
      sourceid: 323232,
      time: 241,
    },
    request,
  );

  expect(intents).toHaveLength(2);
  expect(intents.map((intent) => intent.action)).toEqual(['start', 'play']);

  const startplay = JSON.parse(String(intents[0]?.args.data?.logs))[0];
  const play = JSON.parse(String(intents[1]?.args.data?.logs))[0];
  expect(startplay).toEqual({
    action: 'startplay',
    json: {
      content: 'id=323232',
      id: 22712179,
      mainsite: '1',
      mainsiteWeb: '1',
      type: 'song',
    },
  });
  expect(play).toEqual({
    action: 'play',
    json: {
      content: 'id=323232',
      download: 0,
      end: 'playend',
      id: 22712179,
      mainsite: '1',
      mainsiteWeb: '1',
      source: 'album',
      sourceId: 323232,
      time: 241,
      type: 'song',
      wifi: 0,
    },
  });
});

test('scrobble keeps list as the default source', async () => {
  const { intents, request } = captureRequests();

  await runScrobble({ id: 22712179, sourceid: 323232, time: 241 }, request);

  const play = JSON.parse(String(intents[1]?.args.data?.logs))[0];
  expect(play.json.source).toBe('list');
});
