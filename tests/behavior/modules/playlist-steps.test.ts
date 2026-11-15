import { afterAll, beforeAll, expect, test } from 'bun:test';

import * as sdk from '../../../index.ts';
import { loadProgrammaticApi } from '../../../src/app/module-api.ts';
import { createServer } from '../../../src/server/create-server.ts';
import { settle } from '../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readWebBody } from '../../_kit/upstream/wire.ts';

const originalRandom = Math.random;
beforeAll(() => {
  Math.random = () => 0;
});
afterAll(() => {
  Math.random = originalRandom;
});
const url = 'https://music.163.com/weapi/v1/playlist/manipulate/tracks';
const input = { op: 'add' as const, pid: 7, tracks: [17, '18'] };

// 所有业务响应都是合成数据，只证明请求编排和公开失败合同。
test('playlist steps initial success consumes one provider', async () => {
  let providers = 0;
  await withScenario(
    [{ url, method: 'POST', response: () => Response.json({ code: 200 }) }],
    async (scenario) => {
      const result = await sdk.playlistTracks(
        { ...input, step: 'initial' },
        {
          cookie: 'MUSIC_U=first',
          fetcher: scenario.fetcher,
          checkToken: async () => {
            providers++;
            return 'initial-token';
          },
        },
      );
      expect(result).toMatchObject({
        status: 200,
        body: { code: 200 },
        cookie: [],
      });
      expect(providers).toBe(1);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

test('playlist steps initial exposes business 512', async () => {
  let providers = 0;
  await withScenario(
    [
      {
        url,
        method: 'POST',
        response: () =>
          Response.json(
            { code: 512, message: 'synthetic fallback' },
            { headers: { 'set-cookie': 'step=first; Path=/' } },
          ),
      },
    ],
    async (scenario) => {
      const result = await settle(
        sdk.playlistTracks(
          { ...input, step: 'initial' },
          {
            cookie: 'MUSIC_U=first',
            fetcher: scenario.fetcher,
            checkToken: async () => {
              providers++;
              return 'initial-token';
            },
          },
        ),
      );
      expect(result).toMatchObject({
        rejected: {
          status: 512,
          body: { code: 512 },
          cookie: ['step=first; Path=/'],
        },
      });
      expect(
        sdk.getNcmFailureInfo(
          'rejected' in result ? result.rejected : undefined,
        ),
      ).toMatchObject({ kind: 'business', code: 512 });
      expect(providers).toBe(1);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

for (const mode of ['none', 'string', 'provider'] as const) {
  test(`playlist steps defer a fresh token until business 512 with ${mode}`, async () => {
    let providers = 0;
    const events: Array<unknown> = [];
    const tracks = Object.freeze([17, '18']);
    await withScenario(
      [0, 1].map((index) => ({
        url,
        method: 'POST',
        check: (wire) => {
          const token = mode === 'none' ? undefined : `step-token-${index}`;
          expect(wire.headers.get('cookie')).toContain(
            `MUSIC_U=session-${index}`,
          );
          expect(wire.headers.get('cookie')).toContain(
            `deviceId=device-${index}`,
          );
          expect(readWebBody(wire.body)).toMatchObject({
            csrf_token: `csrf-${index}`,
          });
          expect(wire.headers.get('X-antiCheatToken')).toBe(token ?? null);
          expect(readWebBody(wire.body)).toMatchObject({
            op: 'del',
            pid: 7,
            imme: 'true',
            trackIds: index ? '["17","18","17","18"]' : '["17","18"]',
          });
          const data = readWebBody(wire.body);
          if (token) expect(data).toHaveProperty('checkToken', token);
          else expect(data).not.toHaveProperty('checkToken');
          expect(data).not.toHaveProperty('step');
          expect(wire.url).not.toContain('step-token');
          expect(wire.headers.get('cookie')).not.toContain('step-token');
        },
        response: () => Response.json({ code: index ? 200 : 512 }),
      })),
      async (scenario) => {
        const client = sdk.createHanaMusicApi({
          cookie: 'MUSIC_U=steps',
          fetcher: scenario.fetcher,
          onRequestEvent: (event) => events.push(event),
        });
        const token = (index: number) => ({
          cookie: `MUSIC_U=session-${index}; __csrf=csrf-${index}`,
          state: { deviceId: `device-${index}` },
          ...(mode === 'none'
            ? {}
            : {
                checkToken:
                  mode === 'string'
                    ? `step-token-${index}`
                    : async () => {
                        providers++;
                        return `step-token-${index}`;
                      },
              }),
        });
        const first = await settle(
          client.playlistTracks(
            { op: 'del', pid: 7, tracks, step: 'initial' },
            token(0),
          ),
        );
        expect(
          sdk.getNcmFailureInfo(
            'rejected' in first ? first.rejected : undefined,
          ),
        ).toMatchObject({ kind: 'business', code: 512 });
        expect(scenario.sent).toHaveLength(1);
        expect(providers).toBe(mode === 'provider' ? 1 : 0);
        const second = await client.playlistTracks(
          { op: 'del', pid: 7, tracks, step: 'fallback' },
          token(1),
        );
        expect(second.body).toMatchObject({ code: 200 });
        expect(providers).toBe(mode === 'provider' ? 2 : 0);
        expect(scenario.sent).toHaveLength(2);
        expect(tracks).toEqual([17, '18']);
        expect(JSON.stringify(events)).not.toContain('step-token');
      },
    );
  });
}

for (const step of ['initial', 'fallback'] as const) {
  for (const code of [200, 512, 405, -460]) {
    test(`playlist steps ${step} stops after business ${code}`, async () => {
      await withScenario(
        [
          {
            url,
            method: 'POST',
            check: (wire) =>
              expect(readWebBody(wire.body)).toMatchObject({
                trackIds:
                  step === 'initial' ? '["17","18"]' : '["17","18","17","18"]',
              }),
            response: () => Response.json({ code }),
          },
        ],
        async (scenario) => {
          const result = await settle(
            sdk.playlistTracks(
              { ...input, step },
              { cookie: 'MUSIC_U=steps', fetcher: scenario.fetcher },
            ),
          );
          if (code === 200)
            expect(result).toMatchObject({ resolved: { body: { code } } });
          else
            expect(result).toMatchObject({
              rejected: { body: { code }, failure: { kind: 'business', code } },
            });
          expect(scenario.sent).toHaveLength(1);
        },
      );
    });
  }
  for (const failure of ['empty', 'throw', 'cancel', 'timeout'] as const) {
    test(`playlist steps ${step} provider ${failure} sends nothing`, async () => {
      let finish: ((value: string) => void) | undefined;
      let providers = 0;
      const stage = createStage('step token');
      const controller = new AbortController();
      await withScenario([], async (scenario) => {
        const pending = settle(
          sdk.playlistTracks(
            { ...input, step },
            {
              cookie: 'MUSIC_U=steps',
              fetcher: scenario.fetcher,
              signal: controller.signal,
              timeoutMs: failure === 'timeout' ? 50 : 1000,
              checkToken: async () => {
                providers++;
                if (failure === 'empty') return '';
                if (failure === 'throw') throw new Error('secret-step-token');
                return new Promise<string>((resolve) => {
                  finish = resolve;
                  stage.reach();
                });
              },
            },
          ),
        );
        if (failure === 'cancel' || failure === 'timeout') {
          await stage.wait(pending);
          if (failure === 'cancel') controller.abort();
        }
        const result = await pending;
        expect(result).toMatchObject({
          rejected: {
            status:
              failure === 'cancel' ? 499 : failure === 'timeout' ? 504 : 400,
            failure: {
              kind:
                failure === 'cancel'
                  ? 'cancelled'
                  : failure === 'timeout'
                    ? 'timeout'
                    : 'invalidRequest',
            },
          },
        });
        finish?.('late-step-token');
        await Promise.resolve();
        expect(scenario.entries).toHaveLength(0);
        expect(providers).toBe(1);
        expect(JSON.stringify(result)).not.toContain('secret-step-token');
      });
    });
  }
  for (const failure of ['cancel', 'timeout', 'transport', 'shape'] as const) {
    test(`playlist steps ${step} execution ${failure} never continues`, async () => {
      const controller = new AbortController();
      await withScenario(
        [
          {
            url,
            method: 'POST',
            ...(failure === 'transport'
              ? { reject: new Error('synthetic socket failure') }
              : {}),
            response: async (wire) => {
              if (failure === 'shape') return Response.json([]);
              if (failure === 'cancel') controller.abort();
              return new Promise<Response>((_resolve, reject) => {
                if (wire.signal.aborted)
                  reject(new DOMException('cancelled', 'AbortError'));
                else
                  wire.signal.addEventListener(
                    'abort',
                    () => reject(new DOMException('cancelled', 'AbortError')),
                    { once: true },
                  );
              });
            },
          },
        ],
        async (scenario) => {
          const result = await settle(
            sdk.playlistTracks(
              { ...input, step },
              {
                cookie: 'MUSIC_U=steps',
                fetcher: scenario.fetcher,
                signal: controller.signal,
                timeoutMs: 50,
                retry: { retries: 3 },
              },
            ),
          );
          expect(result).toMatchObject({
            rejected: {
              failure: {
                kind:
                  failure === 'cancel'
                    ? 'cancelled'
                    : failure === 'timeout'
                      ? 'timeout'
                      : failure === 'shape'
                        ? 'upstreamShape'
                        : 'transport',
              },
            },
          });
          expect(scenario.sent).toHaveLength(1);
        },
      );
    });
  }
  test(`playlist steps ${step} HTTP exposes 512 without failure metadata`, async () => {
    await withScenario(
      [{ url, method: 'POST', response: () => Response.json({ code: 512 }) }],
      async (scenario) => {
        const server = await createServer(
          {},
          { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
        );
        const result = await server.request('/playlist/tracks', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: 'MUSIC_U=http',
          },
          body: JSON.stringify({ ...input, step }),
        });
        expect(result.status).toBe(512);
        expect(await result.json()).toEqual({ code: 512 });
        expect(scenario.sent).toHaveLength(1);
      },
    );
  });
  for (const entry of [
    'client',
    'named',
    'invoke',
    'dynamic',
    'http',
  ] as const) {
    test(`playlist steps ${step} via ${entry} uses one real module request`, async () => {
      await withScenario(
        [
          {
            url,
            method: 'POST',
            check: (wire) =>
              expect(readWebBody(wire.body)).toMatchObject({
                trackIds:
                  step === 'initial' ? '["17","18"]' : '["17","18","17","18"]',
              }),
            response: () => Response.json({ code: 200 }),
          },
        ],
        async (scenario) => {
          const query = { ...input, step };
          const config = { cookie: 'MUSIC_U=entry', fetcher: scenario.fetcher };
          if (entry === 'http') {
            const server = await createServer(
              {},
              {
                execution: { fetcher: scenario.fetcher, entropy: testEntropy },
              },
            );
            const result = await server.request('/playlist/tracks', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                cookie: config.cookie,
              },
              body: JSON.stringify(query),
            });
            expect(result.status).toBe(200);
            expect(await result.json()).toMatchObject({ code: 200 });
          } else {
            const result =
              entry === 'client'
                ? await sdk.createHanaMusicApi(config).playlistTracks(query)
                : entry === 'named'
                  ? await sdk.playlistTracks(query, config)
                  : entry === 'invoke'
                    ? await sdk.invokeModule('playlist_tracks', query, config)
                    : await (
                        await loadProgrammaticApi(
                          {},
                          { fetcher: scenario.fetcher, entropy: testEntropy },
                        )
                      ).playlist_tracks(query, config);
            expect(result).toMatchObject({
              status: 200,
              body: { code: 200 },
              cookie: [],
            });
          }
          expect(scenario.sent).toHaveLength(1);
        },
      );
    });
  }
}

test('playlist steps isolated calls keep their own identity and cancellation', async () => {
  const controller = new AbortController();
  const stage = createStage('first waiting for token');
  let finish!: (value: string) => void;
  await withScenario(
    [
      {
        url,
        method: 'POST',
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain('MUSIC_U=second');
          expect(wire.headers.get('cookie')).toContain(
            'deviceId=second-device',
          );
          expect(wire.headers.get('cookie')).toContain('os=web');
          expect(wire.headers.get('cookie')).not.toContain('first');
          expect(wire.headers.get('cookie')).not.toContain('appver=');
          expect(wire.headers.get('X-antiCheatToken')).toBe('second-token');
          expect(readWebBody(wire.body)).toMatchObject({
            checkToken: 'second-token',
            csrf_token: 'second-csrf',
            trackIds: '["17","18","17","18"]',
          });
        },
        response: () =>
          Response.json(
            { code: 200 },
            { headers: { 'set-cookie': 'step=second; Path=/' } },
          ),
      },
    ],
    async (scenario) => {
      const client = sdk.createHanaMusicApi({ fetcher: scenario.fetcher });
      const first = settle(
        client.playlistTracks(
          { ...input, step: 'initial' },
          {
            cookie: 'MUSIC_U=first; __csrf=first-csrf',
            state: { deviceId: 'first-device' },
            signal: controller.signal,
            timeoutMs: 500,
            checkToken: () =>
              new Promise<string>((resolve) => {
                finish = resolve;
                stage.reach();
              }),
          },
        ),
      );
      await stage.wait(first);
      controller.abort();
      const second = await client.playlistTracks(
        { ...input, step: 'fallback' },
        {
          cookie: 'MUSIC_U=second; __csrf=second-csrf; appver=untrusted',
          state: { deviceId: 'second-device' },
          timeoutMs: 1000,
          checkToken: 'second-token',
        },
      );
      finish('late-first-token');
      expect(await first).toMatchObject({
        rejected: { failure: { kind: 'cancelled' } },
      });
      expect(second.cookie).toEqual(['step=second; Path=/']);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});
