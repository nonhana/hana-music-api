import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import type { CreateHanaMusicApiConfig } from '../../../index.ts';
import { assertNoLeaks, redact } from '../../../scripts/lib/redaction.ts';
import { buildCallServices } from '../../../src/core/call.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { projectRoot } from '../../_kit/assertions.ts';
import { fingerprint, writeEvidence } from '../../_kit/evidence.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import {
  createLiveSession,
  readLiveOptions,
  safeLiveFailure,
} from '../../_kit/live.ts';
import type { UpstreamExpectation } from '../../_kit/upstream/scenario.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../_kit/upstream/wire.ts';

test('explicit live invocation requires the exact gate before reading credentials', async () => {
  for (const gate of [undefined, '', '0', 'true']) {
    await assert.rejects(readLiveOptions({ LIVE_UPSTREAM: gate }), /blocked/);
  }
});

const createControlClient = (config: CreateHanaMusicApiConfig) =>
  createClientFromContext(
    config,
    buildCallServices(config, true, { entropy: testEntropy }),
  );

const credentials = {
  LIVE_UPSTREAM: '1',
  HANA_LIVE_SUITE: 'authenticated',
  NCM_LIVE_COOKIE: 'MUSIC_U=current-control',
  NCM_LIVE_EXPECTED_UID: '17',
};
const account = (uid = 17) => ({
  code: 200,
  account: { id: uid, anonimousUser: false },
  profile: { userId: uid },
});
const entry = (
  path: string,
  body: unknown,
  times = 1,
): UpstreamExpectation => ({
  url: `https://${path.startsWith('weapi/') ? 'music.163.com' : 'interface.music.163.com'}/${path}`,
  method: 'POST',
  times,
  response: () => Response.json(body),
});

const writeControl = async (
  work: (options: Awaited<ReturnType<typeof readLiveOptions>>) => Promise<void>,
) => {
  const root = await mkdtemp(resolve(tmpdir(), 'hana-live-control-'));
  try {
    const tokenPath = resolve(root, 'fresh');
    await writeFile(tokenPath, 'fresh-control');
    await work(
      await readLiveOptions({
        ...credentials,
        HANA_LIVE_SUITE: 'writes',
        HANA_LIVE_ALLOW_WRITE: '1',
        HANA_LIVE_WRITE_AUTHORIZATION: 'isolated-control-only',
        NCM_LIVE_PLAYLIST_ID: '99',
        NCM_LIVE_CHECK_TOKEN_FILE: tokenPath,
      }),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const initial = () => [
  entry('api/w/nuser/account/get', account()),
  entry('eapi/v6/playlist/detail', {
    code: 200,
    playlist: {
      id: 99,
      trackIds: [],
      creator: { userId: 18 },
      subscribed: false,
    },
  }),
];
const page = (ids: Array<number>, more = false, times = 1) =>
  entry(
    'weapi/user/playlist',
    { code: 200, playlist: ids.map((id) => ({ id })), more },
    times,
  );

test('credentials require one source, current identity, fresh token and this run authorization', async () => {
  await assert.rejects(
    readLiveOptions({ ...credentials, NCM_LIVE_COOKIE_FILE: '/unread' }),
    /conflicting/,
  );
  await assert.rejects(
    readLiveOptions({ ...credentials, NCM_LIVE_EXPECTED_UID: '' }),
    /expected UID/,
  );
  await assert.rejects(
    readLiveOptions({ ...credentials, NCM_LIVE_COOKIE: '' }),
    /current login/,
  );
  await assert.rejects(
    readLiveOptions({
      ...credentials,
      HANA_LIVE_SUITE: 'writes',
      HANA_LIVE_ALLOW_WRITE: '1',
    }),
    /authorization/,
  );
  const root = await mkdtemp(resolve(tmpdir(), 'hana-live-cookie-'));
  try {
    const path = resolve(root, 'cookie');
    await writeFile(path, credentials.NCM_LIVE_COOKIE);
    expect(
      (
        await readLiveOptions({
          ...credentials,
          NCM_LIVE_COOKIE: undefined,
          NCM_LIVE_COOKIE_FILE: path,
        })
      ).cookie,
    ).toBe(credentials.NCM_LIVE_COOKIE);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('loginStatus.data identity mismatch fails and prevents subsequent business requests', async () => {
  await withScenario(
    [entry('api/w/nuser/account/get', account(18))],
    async ({ fetcher, sent }) => {
      const session = createLiveSession(
        await readLiveOptions(credentials),
        (config) => createControlClient({ ...config, fetcher, crypto: 'api' }),
      );
      await assert.rejects(session.account(), /live failed/);
      await assert.rejects(session.catalog(), /stopped/);
      expect(sent).toHaveLength(1);
      expect(JSON.stringify(session.snapshot())).not.toContain(
        'current-control',
      );
    },
  );
});

test('anonymous budget counts initialization, is shared across files and blocks the thirteenth send', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ anonymousToken: '' });
  try {
    await withScenario(
      [
        {
          ...entry('weapi/register/anonimous', {}),
          response: () =>
            Response.json(
              { code: 200 },
              { headers: { 'Set-Cookie': 'MUSIC_A=control; Path=/' } },
            ),
        },
        entry('api/toplist', { code: 200, list: [{ id: 3 }] }, 6),
        entry(
          'eapi/artist/head/info/get',
          { code: 200, data: { artist: { id: 6452 } } },
          5,
        ),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          await readLiveOptions({ LIVE_UPSTREAM: '1' }),
          (config) =>
            createControlClient({ ...config, fetcher, crypto: 'api' }),
        );
        for (let repeat = 0; repeat < 5; repeat++) await session.catalog();
        await assert.rejects(session.catalog(), /live failed/);
        expect(sent).toHaveLength(12);
        expect(session.snapshot().attempts).toEqual({
          business: 12,
          cleanup: 0,
        });
        await assert.rejects(session.catalog(), /stopped/);
      },
    );
  } finally {
    setRuntimeState(previous);
  }
});

test('anonymous search, detail and lyric use the derived ID and catalog uses the expected artist', async () => {
  await withScenario(
    [
      entry('eapi/search/get', { code: 200, result: { songs: [{ id: 7 }] } }),
      {
        ...entry('weapi/v3/song/detail', {
          code: 200,
          songs: [{ id: 7 }],
          privileges: [{ id: 7 }],
        }),
        check: (wire) =>
          expect(readWebBody(wire.body)).toMatchObject({ c: '[{"id":7}]' }),
      },
      {
        ...entry('eapi/song/lyric', { code: 200, lrc: { lyric: 'control' } }),
        check: (wire) =>
          expect(readEapiBody(wire.body).data).toMatchObject({ id: 7 }),
      },
      entry('api/toplist', { code: 200, list: [{ id: 1 }] }),
      entry('eapi/artist/head/info/get', {
        code: 200,
        data: { artist: { id: 6452 } },
      }),
    ],
    async ({ fetcher }) => {
      const session = createLiveSession(
        await readLiveOptions({ LIVE_UPSTREAM: '1' }),
        (config) =>
          createControlClient({
            ...config,
            cookie: 'MUSIC_A=control',
            crypto: 'api',
            fetcher,
          }),
      );
      await session.searchToDetail();
      await session.catalog();
      expect(session.snapshot().attempts.business).toBe(5);
    },
  );
});

test('write cycle sends each write once, forwards the fresh token only on subscribe and confirms restoration', async () =>
  writeControl(async (options) => {
    const pauses: Array<number> = [];
    await withScenario(
      [
        ...initial(),
        page([]),
        {
          ...entry('weapi/playlist/subscribe', { code: 200 }),
          check: (wire) => {
            expect(readWebBody(wire.body)).toMatchObject({
              checkToken: 'fresh-control',
            });
            expect(wire.headers.get('x-antiCheatToken')).toBe('fresh-control');
          },
        },
        page([99]),
        {
          ...entry('weapi/playlist/unsubscribe', { code: 200 }),
          check: (wire) => {
            expect(readWebBody(wire.body)).not.toHaveProperty('checkToken');
            expect(wire.headers.get('x-antiCheatToken')).toBeNull();
          },
        },
        page([]),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {
            pauses.push(1);
          },
        );
        await session.playlistCycle();
        expect(session.snapshot().restoration).toBe('confirmed');
        expect(sent).toHaveLength(7);
        expect(pauses).toHaveLength(2);
        expect(session.snapshot().attempts).toEqual({
          business: 7,
          cleanup: 0,
        });
      },
    );
  }));

test('incomplete initial pagination stops after five pages and sends no write', async () =>
  writeControl(async (options) => {
    await withScenario(
      [...initial(), page([], true, 5)],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(sent).toHaveLength(7);
        expect(session.snapshot().restoration).toBe('not-needed');
      },
    );
  }));

test('failed confirmation stops business after two reads and uses reserved one-cancel restoration', async () =>
  writeControl(async (options) => {
    await withScenario(
      [
        ...initial(),
        page([]),
        entry('weapi/playlist/subscribe', { code: 200 }),
        page([], false, 2),
        entry('weapi/playlist/unsubscribe', { code: 200 }),
        page([]),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(session.snapshot().restoration).toBe('confirmed');
        expect(session.snapshot().attempts).toEqual({
          business: 6,
          cleanup: 2,
        });
        expect(
          sent.filter((request) =>
            request.url.endsWith('/playlist/unsubscribe'),
          ),
        ).toHaveLength(1);
      },
    );
  }));

test('ambiguous subscribe failure performs authorized cleanup and unconfirmed restoration remains failed', async () =>
  writeControl(async (options) => {
    await withScenario(
      [
        ...initial(),
        page([]),
        entry('weapi/playlist/subscribe', { code: 500 }),
        entry('weapi/playlist/unsubscribe', { code: 200 }),
        page([99]),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(session.snapshot().restoration).toBe('unconfirmed');
        expect(session.snapshot().failures).toHaveLength(2);
        expect(
          sent.filter((request) => request.url.endsWith('/playlist/subscribe')),
        ).toHaveLength(1);
      },
    );
  }));

test('failed cancel is never repeated and cleanup remains within its six-request reserve', async () =>
  writeControl(async (options) => {
    await withScenario(
      [
        ...initial(),
        page([]),
        entry('weapi/playlist/subscribe', { code: 200 }),
        page([99]),
        entry('weapi/playlist/unsubscribe', { code: 500 }),
        page([], true, 5),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(session.snapshot().restoration).toBe('unconfirmed');
        expect(session.snapshot().attempts.cleanup).toBe(5);
        expect(
          sent.filter((request) =>
            request.url.endsWith('/playlist/unsubscribe'),
          ),
        ).toHaveLength(1);
      },
    );
  }));

test('live and evidence redact secrets even when the recorder-only bypass environment exists', async () => {
  const sentinel = 'live-secret-sentinel';
  const raw = {
    cookie: sentinel,
    token: sentinel,
    nested: { password: sentinel, tokenVersion: 1 },
    message: `MUSIC_U=${sentinel}`,
  };
  const safe = redact(raw, 'control');
  assertNoLeaks(safe, 'control');
  expect(JSON.stringify(safe)).not.toContain(sentinel);
  expect(
    JSON.stringify(safeLiveFailure('control', { ...raw, status: 502 })),
  ).not.toContain(sentinel);
  const root = await mkdtemp(resolve(tmpdir(), 'hana-live-evidence-'));
  try {
    const report = await writeEvidence(
      {
        suite: 'control',
        command: [],
        startedAt: new Date().toISOString(),
        candidate: await fingerprint(projectRoot),
        exitCode: 1,
        counts: { pass: 0, fail: 1, skip: 0 },
        details: raw,
      },
      root,
      root,
    );
    expect(await readFile(report.artifacts.summary, 'utf8')).not.toContain(
      sentinel,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('explicit live command without gate exits nonzero with no package preparation or network', async () => {
  const child = Bun.spawn([process.execPath, 'scripts/test.mts', 'live'], {
    cwd: projectRoot,
    env: { ...process.env, LIVE_UPSTREAM: '0' },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  expect(await child.exited).toBe(1);
  const output = JSON.parse(await new Response(child.stdout).text());
  const report = JSON.parse(await readFile(output.report, 'utf8'));
  expect(report.details.commands).toEqual([]);
  expect(report.details.failure).toContain('blocked');
});

test('writes refuse an owned or already collected target before any write', async () =>
  writeControl(async (options) => {
    for (const own of [true, false]) {
      const detail = entry('eapi/v6/playlist/detail', {
        code: 200,
        playlist: {
          id: 99,
          trackIds: [],
          creator: { userId: own ? 17 : 18 },
          subscribed: false,
        },
      });
      await withScenario(
        [
          entry('api/w/nuser/account/get', account()),
          detail,
          ...(own ? [] : [page([99])]),
        ],
        async ({ fetcher, sent }) => {
          const session = createLiveSession(
            options,
            (config) =>
              createControlClient({ ...config, crypto: 'api', fetcher }),
            async () => {},
          );
          await assert.rejects(session.playlistCycle(), /live failed/);
          expect(
            sent.some((wire) => wire.url.includes('/playlist/subscribe')),
          ).toBe(false);
          expect(session.snapshot().restoration).toBe('not-needed');
        },
      );
    }
  }));

test('write business budget stops at thirty attempts without consuming the restoration reserve', async () =>
  writeControl(async (options) => {
    await withScenario(
      [entry('api/w/nuser/account/get', account(), 30)],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        for (let repeat = 0; repeat < 30; repeat++) await session.account();
        await assert.rejects(session.account(), /live failed/);
        expect(sent).toHaveLength(30);
        expect(session.snapshot().attempts).toEqual({
          business: 30,
          cleanup: 0,
        });
      },
    );
  }));

test('ambiguous write cleanup uses at most one cancel and five confirmation pages', async () =>
  writeControl(async (options) => {
    await withScenario(
      [
        ...initial(),
        page([]),
        entry('weapi/playlist/subscribe', { code: 500 }),
        entry('weapi/playlist/unsubscribe', { code: 200 }),
        page([], true, 5),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(session.snapshot().attempts.cleanup).toBe(6);
        expect(session.snapshot().restoration).toBe('unconfirmed');
        expect(
          sent.filter((wire) => wire.url.endsWith('/playlist/unsubscribe')),
        ).toHaveLength(1);
      },
    );
  }));

test('unknown creator identity stops before any collection read or write', async () =>
  writeControl(async (options) => {
    await withScenario(
      [
        entry('api/w/nuser/account/get', account()),
        entry('eapi/v6/playlist/detail', {
          code: 200,
          playlist: { id: 99, trackIds: [], creator: {}, subscribed: false },
        }),
      ],
      async ({ fetcher, sent }) => {
        const session = createLiveSession(
          options,
          (config) =>
            createControlClient({ ...config, crypto: 'api', fetcher }),
          async () => {},
        );
        await assert.rejects(session.playlistCycle(), /live failed/);
        expect(sent).toHaveLength(2);
        expect(session.snapshot().restoration).toBe('not-needed');
      },
    );
  }));
