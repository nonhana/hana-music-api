import { expect, spyOn, test } from 'bun:test';

import { createServer } from '../../../src/server/create-server.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';

test('debug raw request uses the internal instance fetcher at the final wire', async () => {
  let fallbacks = 0;
  const standardFetch = spyOn(globalThis, 'fetch').mockImplementation(
    Object.assign(
      async () => {
        fallbacks += 1;
        throw new Error('Debug request bypassed its instance fetcher');
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  );
  try {
    await withScenario(
      [
        {
          url: 'https://interface.music.163.com/api/context/probe',
          method: 'POST',
          check: (wire) => {
            expect(new URLSearchParams(wire.body).get('id')).toBe('7');
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=debug-context',
            );
          },
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        const app = await createServer(
          { hostname: '127.0.0.1', debugApiRequests: true },
          {
            allowDebugApiRequests: true,
            execution: { fetcher: scenario.fetcher },
          },
        );
        const response = await app.request('/demo/api-debug/request', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: 'MUSIC_U=debug-context',
          },
          body: JSON.stringify({
            uri: '/api/context/probe',
            crypto: 'api',
            data: { id: 7 },
          }),
        });
        expect(fallbacks).toBe(0);
        expect(response.status).toBe(200);
        expect(scenario.sent).toHaveLength(1);
      },
    );
  } finally {
    standardFetch.mockRestore();
  }
});
