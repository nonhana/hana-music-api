import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { startServer } from '../../../src/app/cli.ts';
import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import { moduleResponse } from '../../_kit/module.ts';
import { allowLoopback } from '../../_kit/upstream/offline.ts';

test('bounds 100 real HTTP requests and ignores forged forwarding headers', async () => {
  for (const burst of [10, 200]) {
    let active = 0;
    let peak = 0;
    let calls = 0;
    const { server, url } = await startServer({
      hostname: '127.0.0.1',
      port: 0,
      silent: true,
      traffic: { burst },
      cacheEnabled: false,
      moduleDefinitions: [
        {
          identifier: 'search',
          route: '/search',
          decodeInput: decodeLegacyModuleInput,
          execute: () =>
            Effect.gen(function* () {
              active += 1;
              calls += 1;
              peak = Math.max(peak, active);
              yield* Effect.sleep(100);
              active -= 1;
              return { body: { code: 200 }, cookie: [], status: 200 };
            }).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const disallow = allowLoopback(url);
    try {
      const responses = await Promise.all(
        Array.from({ length: 100 }, (_, index) =>
          fetch(new URL(`/search?key=${index}`, url), {
            headers: { 'X-Forwarded-For': `10.0.0.${index}` },
          }),
        ),
      );
      expect(peak).toBeLessThanOrEqual(32);
      expect(calls).toBe(burst === 10 ? 10 : 32);
      expect(
        responses.filter(
          (response) => response.status === (burst === 10 ? 429 : 503),
        ),
      ).toHaveLength(100 - calls);
      for (const response of responses) {
        if (response.status !== 200) {
          expect(response.headers.get('retry-after')).toBe('1');
        }
        await response.text();
      }
      expect(active).toBe(0);
    } finally {
      await server.stop(true);
      disallow();
    }
  }
});
