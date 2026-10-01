import { beforeEach, expect, spyOn, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../index.ts';
import { invokeModule as invokeProgrammatic } from '../../src/app/module-api.ts';
import { buildCallServices, runCall } from '../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
import { resolveProcessServices } from '../../src/core/runtime.ts';
import {
  resetDefaultTrafficGovernor,
  TrafficGovernor,
} from '../../src/core/traffic.ts';
import audioMatch from '../../src/modules/audio_match.ts';
import avatarUpload from '../../src/modules/avatar_upload.ts';
import relatedPlaylist from '../../src/modules/related_playlist.ts';
import voiceUpload from '../../src/modules/voice_upload.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import { createServer } from '../../src/server/create-server.ts';
import type {
  FetchLike,
  ModuleEffect,
  ModuleQuery,
} from '../../src/types/index.ts';
import { runEffect } from '../_kit/it.ts';
import { clientLayer } from '../_kit/layers.ts';
import { mockRequest, moduleResponse } from '../fixtures/request-capability.ts';
import {
  initXml,
  relatedHtml,
  songFile,
  tokenBody,
} from '../fixtures/upload-effect.ts';

beforeEach(() => resetDefaultTrafficGovernor());

const requestUrl = (input: Request | URL | string): string =>
  typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

const fetchUpload: FetchLike = async (input) => {
  const target = requestUrl(input);
  if (target.includes('nos/token/alloc')) {
    return Response.json(tokenBody);
  }
  if (target.endsWith('?uploads')) {
    return new Response(initXml);
  }
  if (target.includes('cloud/upload/check')) {
    return Response.json({ code: 200, needUpload: true, songId: 7 });
  }
  if (target.includes('/lbs?')) {
    return Response.json({ upload: ['https://nosup-hz1.127.net'] });
  }
  if (target.includes('/playlist?')) {
    return new Response(relatedHtml);
  }
  return Response.json(
    { code: 200, data: { marker: 'kept' }, songId: 7 },
    { headers: { etag: 'etag-1' } },
  );
};

test.each([
  {
    identifier: 'voice_upload',
    input: { songFile },
    file: 'songFile',
    count: 6,
  },
  {
    identifier: 'avatar_upload',
    input: { imgFile: songFile },
    file: 'imgFile',
    count: 3,
  },
  {
    identifier: 'playlist_cover_update',
    input: { imgFile: songFile, id: 1 },
    file: 'imgFile',
    count: 3,
  },
  { identifier: 'cloud', input: { songFile }, file: 'songFile', count: 7 },
  {
    identifier: 'audio_match',
    input: { audioFP: 'fp', duration: 3 },
    file: '',
    count: 1,
  },
  { identifier: 'related_playlist', input: { id: 1 }, file: '', count: 1 },
] as const)(
  '$identifier executes through SDK, programmatic and Hono without legacy runtime',
  async (scenario) => {
    let sent = 0;
    const fetcher: FetchLike = async (...args) => {
      sent += 1;
      return fetchUpload(...args);
    };
    const upstream = spyOn(globalThis, 'fetch').mockImplementation(
      fetcher as typeof fetch,
    );
    try {
      const config = {
        cookie: 'MUSIC_U=' + scenario.identifier,
        crypto: 'api' as const,
        fetcher,
      };
      const client = createHanaMusicApi(config);
      const method = scenario.identifier.replace(
        /_([a-z])/g,
        (_match, character: string) => character.toUpperCase(),
      );
      expect(
        (
          await Reflect.apply(client[method as keyof typeof client], client, [
            scenario.input,
          ])
        ).status,
      ).toBe(200);
      expect(
        (
          await invokeProgrammatic(scenario.identifier, {
            ...scenario.input,
            ...config,
          })
        ).status,
      ).toBe(200);
      const app = await createServer();
      const form = new FormData();
      for (const [key, value] of Object.entries(scenario.input)) {
        form.set(
          key,
          key === scenario.file
            ? new File(['12'], 'demo.mp3', { type: 'audio/mpeg' })
            : String(value),
        );
      }
      const response = await app.request(
        '/' + scenario.identifier.replaceAll('_', '/'),
        {
          method: 'POST',
          body: form,
          headers: { cookie: config.cookie },
        },
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ code: 200 });
      expect(sent).toBe(scenario.count * 3);
    } finally {
      upstream.mockRestore();
    }
  },
  20_000,
);

test('generated registries expose 351 unique Effect implementations', () => {
  expect(
    Object.keys(createHanaMusicApi({ cookie: 'MUSIC_U=registry' })),
  ).toHaveLength(351);
  expect(Object.keys(sdkModuleRegistry)).toHaveLength(351);
});

test('the LBS host is validated before any bytes are sent outside approved NOS hosts', async () => {
  const targets: Array<string> = [];
  const client = createHanaMusicApi({
    cookie: 'MUSIC_U=target-rejection',
    fetcher: async (input, init) => {
      targets.push(requestUrl(input));
      return requestUrl(input).includes('/lbs?')
        ? Response.json({ upload: ['https://music.163.com.evil.example'] })
        : fetchUpload(input, init);
    },
  });
  const error = await client
    .cloud({ songFile })
    .catch((failure: unknown) => failure);
  expect(error).toMatchObject({
    status: 400,
    body: { partialCompletion: true, completedStages: 4 },
  });
  expect(targets).toHaveLength(4);
  expect(targets.some((target) => target.includes('evil.example'))).toBe(false);
});

test.each(['cancel', 'timeout'] as const)(
  'voice %s retains the completed count and stops a stalled NOS body',
  async (mode) => {
    let ready!: () => void;
    const started = new Promise<void>((resolve) => {
      ready = resolve;
    });
    let cancelled = false;
    let sent = 0;
    const controller = new AbortController();
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=voice-' + mode,
      timeoutMs: mode === 'timeout' ? 40 : 1_000,
      fetcher: async (input, init) => {
        sent += 1;
        if (sent === 1) {
          return fetchUpload(input, init);
        }
        return new Response(
          new ReadableStream({
            pull: () => {
              ready();
            },
            cancel: () => {
              cancelled = true;
            },
          }),
        );
      },
    });
    const pending = client
      .voiceUpload({ songFile }, { signal: controller.signal })
      .catch((error: unknown) => error);
    await started;
    if (mode === 'cancel') {
      controller.abort();
    }
    const error = await pending;
    expect(error).toMatchObject({
      status: mode === 'cancel' ? 499 : 504,
      body: { partialCompletion: true, completedStages: 1 },
    });
    expect(cancelled).toBe(true);
    expect(sent).toBe(2);
  },
);

test('voice stage timeout is sixty seconds under the five minute Call budget', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        let ready!: () => void;
        const started = new Promise<void>((resolve) => {
          ready = resolve;
        });
        let sent = 0;
        const pending = runCall(
          {
            identifier: 'voice_upload',
            input: { songFile },
            config: {
              cookie: 'MUSIC_U=stage-timeout',
              fetcher: async (input, init) => {
                sent += 1;
                if (sent === 1) {
                  return fetchUpload(input, init);
                }
                return new Response(
                  new ReadableStream({
                    pull: () => {
                      ready();
                    },
                  }),
                );
              },
            },
          },
          clientLayer(),
          {
            identifier: 'voice_upload',
            route: '/voice/upload',
            decodeInput: decodeLegacyModuleInput,
            execute: voiceUpload,
          },
          undefined,
          clock,
        ).catch((error: unknown) => error);
        yield* Effect.promise(() => started);
        yield* clock.adjust(60_000);
        expect(yield* Effect.promise(() => pending)).toMatchObject({
          status: 504,
          body: { completedStages: 1, partialCompletion: true },
        });
        expect(sent).toBe(2);
      }),
    ),
  );
});

test('concurrent SDK upload cancellations retain each module execution count', async () => {
  const runs = [1, 3].map((completedStages) => {
    let ready!: () => void;
    const started = new Promise<void>((resolve) => {
      ready = resolve;
    });
    const controller = new AbortController();
    let sent = 0;
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=concurrent-' + completedStages,
      fetcher: async (input, init) => {
        sent += 1;
        if (sent <= completedStages) {
          return fetchUpload(input, init);
        }
        return new Response(
          new ReadableStream({
            pull: () => {
              ready();
            },
          }),
        );
      },
    });
    return {
      controller,
      started,
      pending: client
        .voiceUpload({ songFile }, { signal: controller.signal })
        .catch((error: unknown) => error),
    };
  });
  await Promise.all(runs.map((run) => run.started));
  for (const run of runs) {
    run.controller.abort();
  }
  expect(await Promise.all(runs.map((run) => run.pending))).toMatchObject([
    { status: 499, body: { completedStages: 1 } },
    { status: 499, body: { completedStages: 3 } },
  ]);
});

test.each([
  {
    identifier: 'audio_match',
    decodeInput: decodeLegacyModuleInput,
    execute: audioMatch,
    input: { audioFP: 'fp', duration: 3 },
    count: 1,
  },
  {
    identifier: 'related_playlist',
    decodeInput: decodeLegacyModuleInput,
    execute: relatedPlaylist,
    input: { id: 1 },
    count: 1,
  },
  {
    identifier: 'avatar_upload',
    decodeInput: decodeLegacyModuleInput,
    execute: avatarUpload,
    input: { imgFile: songFile },
    count: 2,
  },
])(
  '$identifier holds the shared Governor until its plain response body is cancelled',
  async (scenario) => {
    const governor = new TrafficGovernor();
    const process = {
      ...resolveProcessServices(),
      governor,
    };
    const controller = new AbortController();
    let ready!: () => void;
    const started = new Promise<void>((resolve) => {
      ready = resolve;
    });
    let sent = 0;
    let cancelled = false;
    const pending = runCall(
      {
        identifier: scenario.identifier,
        input: scenario.input,
        signal: controller.signal,
        config: {
          cookie: 'MUSIC_U=body-' + scenario.identifier,
          fetcher: async (input, init) => {
            sent += 1;
            if (sent < scenario.count) {
              return fetchUpload(input, init);
            }
            return new Response(
              new ReadableStream({
                pull: () => {
                  ready();
                },
                cancel: () => {
                  cancelled = true;
                },
              }),
            );
          },
        },
      },
      buildCallServices(process),
      {
        identifier: scenario.identifier,
        route: '/plain',
        decodeInput: decodeLegacyModuleInput,
        execute: scenario.execute as ModuleEffect<ModuleQuery>,
      },
    ).catch((error: unknown) => error);
    await started;
    expect(governor.snapshot.active).toBe(1);
    controller.abort();
    expect(await pending).toMatchObject({ status: 499 });
    expect(cancelled).toBe(true);
    expect(governor.snapshot.active).toBe(0);
    expect(governor.snapshot.waiting).toBe(0);
    expect(sent).toBe(scenario.count);
  },
);

test.each(['audioMatch', 'relatedPlaylist', 'avatarUpload'] as const)(
  '%s forwards proxy to the shared plain transport',
  async (method) => {
    const proxy = 'http://127.0.0.1:18080';
    const proxies: Array<unknown> = [];
    const upstream = spyOn(globalThis, 'fetch').mockImplementation((async (
      input,
      init,
    ) => {
      proxies.push((init as RequestInit & { proxy?: string }).proxy);
      return fetchUpload(input, init);
    }) as typeof fetch);
    try {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=proxy-' + method,
        proxy,
      });
      expect(
        (
          await Reflect.apply(client[method], client, [
            { audioFP: 'fp', duration: 3, id: 1, imgFile: songFile },
          ])
        ).status,
      ).toBe(200);
      expect(proxies).toEqual(
        method === 'avatarUpload' ? [proxy, proxy, proxy] : [proxy],
      );
    } finally {
      upstream.mockRestore();
    }
  },
);

test('Hono preserves the module partial response when multipart initialization fails', async () => {
  const upstream = spyOn(globalThis, 'fetch').mockImplementation((async (
    input,
    init,
  ) =>
    requestUrl(input).endsWith('?uploads')
      ? Response.json({ code: 403, detail: 'retained' }, { status: 403 })
      : fetchUpload(input, init)) as typeof fetch);
  try {
    const app = await createServer();
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
  } finally {
    upstream.mockRestore();
  }
});

test('a custom API handler cannot reinterpret plain upload bodies as API JSON', async () => {
  let apiCalls = 0;
  const plainTargets: Array<string> = [];
  const plainBodies: Array<unknown> = [];
  const fetcher: FetchLike = async (input, init) => {
    plainTargets.push(requestUrl(input));
    plainBodies.push(init?.body);
    return fetchUpload(input, init);
  };
  const result = await invokeProgrammatic(
    'voice_upload',
    { songFile, cookie: 'MUSIC_U=custom-api', fetcher },
    {
      requestHandler: mockRequest(async (target: string) => {
        apiCalls += 1;
        return {
          status: 200,
          cookie: [],
          body:
            target === '/api/nos/token/alloc'
              ? tokenBody
              : { code: 200, data: { marker: 'kept' } },
        };
      }),
    },
  );
  expect(result.body).toEqual({ code: 200, data: { marker: 'kept' } });
  expect(apiCalls).toBe(3);
  expect(plainTargets).toHaveLength(3);
  expect(
    plainTargets.every((target) =>
      target.startsWith('https://ymusic.nos-hz.163yun.com/'),
    ),
  ).toBe(true);
  expect(plainBodies[1]).toEqual(new Uint8Array([1, 2]));
});

test('HTTP admits at most two uploads before consuming multipart bodies', async () => {
  let active = 0;
  let peak = 0;
  let calls = 0;
  const app = await createServer({
    traffic: { burst: 100 },
    moduleDefinitions: [
      {
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
