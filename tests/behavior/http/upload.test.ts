import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import { createServer } from '../../../src/server/create-server.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import { moduleResponse, probeUploadActions } from '../../_kit/module.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { tokenBody } from '../../fixtures/synthetic/upload.ts';

test('Hono preserves the module partial response when multipart initialization fails', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/nos/token/alloc',
        method: 'POST',
        response: () => Response.json(tokenBody),
      },
      {
        url: 'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploads',
        method: 'POST',
        response: () =>
          Response.json({ code: 403, detail: 'retained' }, { status: 403 }),
      },
    ],
    async (scenario) => {
      const app = await createServer(
        {},
        { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
      );
      const form = new FormData();
      form.set('songFile', new File(['12'], 'demo.mp3'));
      const response = await app.request('/voice/upload', {
        method: 'POST',
        body: form,
        headers: { cookie: 'MUSIC_U=http-partial' },
      });
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        partialCompletion: true,
        completedStages: 1,
      });
      expect(scenario.entries).toHaveLength(2);
    },
  );
});

test('HTTP admits at most two uploads before consuming multipart bodies', async () => {
  let active = 0;
  let peak = 0;
  let calls = 0;
  const app = await createServer({
    traffic: { burst: 100 },
    moduleDefinitions: [
      {
        actions: probeUploadActions,
        identifier: 'voice_upload',
        route: '/voice/upload',
        decodeInput: decodeLegacyModuleInput,
        execute: () =>
          Effect.gen(function* () {
            active += 1;
            calls += 1;
            peak = Math.max(peak, active);
            yield* Effect.sleep(20);
            active -= 1;
            return { status: 200, cookie: [], body: { code: 200 } };
          }).pipe(Effect.map(moduleResponse)),
      },
    ],
  });
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => {
      const form = new FormData();
      form.set('songFile', new File(['local'], 'local.mp3'));
      return Promise.resolve(
        app.request('/voice/upload', { method: 'POST', body: form }),
      );
    }),
  );
  expect(peak).toBe(2);
  expect(calls).toBe(2);
  expect(responses.filter((response) => response.status === 503)).toHaveLength(
    18,
  );
  expect(active).toBe(0);
});
