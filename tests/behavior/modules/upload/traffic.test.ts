import { expect, spyOn, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../../../index.ts';
import { invokeModule as invokeProgrammatic } from '../../../../src/app/module-api.ts';
import { buildCallServices, runCall } from '../../../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../../../src/core/module-input.ts';
import audioMatch, {
  moduleActions as audioMatchActions,
} from '../../../../src/modules/audio_match.ts';
import avatarUpload, {
  moduleActions as avatarUploadActions,
} from '../../../../src/modules/avatar_upload.ts';
import relatedPlaylist, {
  moduleActions as relatedPlaylistActions,
} from '../../../../src/modules/related_playlist.ts';
import voiceUpload, {
  moduleActions as voiceUploadActions,
} from '../../../../src/modules/voice_upload.ts';
import { sdkModuleRegistry } from '../../../../src/sdk/generated/registry.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import type {
  FetchLike,
  ModuleEffect,
  ModuleQuery,
} from '../../../../src/types/index.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { clientLayer } from '../../../_kit/layers.ts';
import type { WireRequest } from '../../../_kit/upstream/scenario.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import {
  initXml,
  relatedHtml,
  songFile,
  tokenBody,
} from '../../../fixtures/synthetic/upload.ts';

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
  if (target.includes('playlist/cover/update')) {
    return Response.json({
      code: 200,
      url: 'https://p1.music.126.net/cover.jpg',
    });
  }
  const path = decodeURIComponent(new URL(target).pathname).replace(
    /^\/(?:weapi|eapi)\//,
    '/api/',
  );
  if (
    ![
      '/api/music/audio/match',
      '/api/user/avatar/upload/v1',
      '/api/voice/workbench/voice/batch/upload/preCheck',
      '/api/voice/workbench/voice/batch/upload/v2',
      '/api/upload/cloud/info/v2',
      '/api/cloud/pub/v2',
      '/voice/demo',
      '/yyimgs/voice/demo',
      '/jd-musicrep-privatecloud-audio-public/voice/demo',
    ].includes(path)
  )
    throw new Error(`Unexpected upload route: ${target}`);
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
          await invokeProgrammatic(
            scenario.identifier,
            scenario.input,
            {},
            config,
          )
        ).status,
      ).toBe(200);
      const app = await createServer({}, { execution: { fetcher } });
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

test('generated registries expose 352 unique Effect implementations', () => {
  expect(
    Object.keys(createHanaMusicApi({ cookie: 'MUSIC_U=registry' })),
  ).toHaveLength(352);
  expect(Object.keys(sdkModuleRegistry)).toHaveLength(352);
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
            actions: voiceUploadActions,
            execute: voiceUpload,
          },

          clock,
        ).catch((error: unknown) => error);
        yield* Effect.promise(() => started);
        yield* clock.adjust(60_000);
        const rejection = yield* Effect.promise(() => pending);
        expect(rejection).toMatchObject({
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
    actions: audioMatchActions,
    input: { audioFP: 'fp', duration: 3 },
    count: 1,
  },
  {
    identifier: 'related_playlist',
    decodeInput: decodeLegacyModuleInput,
    execute: relatedPlaylist,
    actions: relatedPlaylistActions,
    input: { id: 1 },
    count: 1,
  },
  {
    identifier: 'avatar_upload',
    decodeInput: decodeLegacyModuleInput,
    actions: avatarUploadActions,
    execute: avatarUpload,
    input: { imgFile: songFile },
    count: 2,
  },
])(
  '$identifier cancels its plain response body when the caller aborts',
  async (scenario) => {
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

        config: {
          signal: controller.signal,
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
      buildCallServices(),
      {
        identifier: scenario.identifier,
        route: '/plain',
        decodeInput: decodeLegacyModuleInput,
        execute: scenario.execute as ModuleEffect<ModuleQuery>,
        actions: scenario.actions,
      },
    ).catch((error: unknown) => error);
    await started;
    controller.abort();
    expect(await pending).toMatchObject({ status: 499 });
    expect(cancelled).toBe(true);
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

test('one fetcher preserves API envelopes and raw plain upload bodies', async () => {
  const nos = 'https://ymusic.nos-hz.163yun.com/voice%2Fdemo';
  const api =
    'https://interface.music.163.com/eapi/voice/workbench/voice/batch/upload';
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/nos/token/alloc',
        method: 'POST',
        check: (wire) =>
          expect(readWebBody(wire.body)).toMatchObject({
            bucket: 'ymusic',
            filename: 'demo',
            ext: 'mp3',
          }),
        response: () => Response.json(tokenBody),
      },
      {
        url: `${nos}?uploads`,
        method: 'POST',
        headers: { cookie: null, 'x-nos-token': 'nos-token' },
        response: () => new Response(initXml),
      },
      {
        url: `${nos}?partNumber=1&uploadId=upload-123`,
        method: 'PUT',
        headers: { cookie: null, 'x-nos-token': 'nos-token' },
        check: (wire) =>
          expect(new TextEncoder().encode(wire.body)).toEqual(
            new Uint8Array([1, 2]),
          ),
        response: () =>
          new Response(new Uint8Array([0, 128, 255]), {
            headers: { etag: 'etag-1' },
          }),
      },
      {
        url: `${nos}?uploadId=upload-123`,
        method: 'POST',
        headers: { cookie: null, 'x-nos-token': 'nos-token' },
        check: (wire) =>
          expect(wire.body).toBe(
            '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>etag-1</ETag></Part></CompleteMultipartUpload>',
          ),
        response: () => new Response(new Uint8Array([0, 128, 255])),
      },
      ...['preCheck', 'v2'].map((stage) => ({
        url: `${api}/${stage}`,
        method: 'POST',
        headers: { 'x-nos-token': 'nos-token' },
        check: (wire: WireRequest) =>
          expect(readEapiBody(wire.body).data).toMatchObject({
            voiceData: expect.any(String),
            dupkey: expect.any(String),
          }),
        response: () => Response.json({ code: 200, data: { marker: 'kept' } }),
      })),
    ],
    async (network) => {
      const result = await invokeProgrammatic(
        'voice_upload',
        { songFile },
        {},
        { cookie: 'MUSIC_U=custom-api', fetcher: network.fetcher },
        { entropy: testEntropy },
      );
      expect(result.body).toEqual({ code: 200, data: { marker: 'kept' } });
      expect(
        network.sent.filter((wire) => wire.url.startsWith('https://ymusic.')),
      ).toHaveLength(3);
      expect(network.sent).toHaveLength(6);
    },
  );
});
