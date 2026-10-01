import { expect, test } from 'bun:test';

import { Effect, Result } from 'effect';
import { TestClock } from 'effect/testing';

import { buildCallServices, runCall } from '../../src/core/call.ts';
import { UpstreamRateLimited } from '../../src/core/errors.ts';
import { resolveProcessServices } from '../../src/core/runtime.ts';
import { TrafficGovernor } from '../../src/core/traffic.ts';
import { transportEffect } from '../../src/core/transport.ts';
import { decodeLegacyModuleInput } from '../../src/modules/_input.ts';
import voiceUpload from '../../src/modules/voice_upload.ts';
import { runEffect } from '../_kit/it.ts';
import { createFakeUpstream } from '../fixtures/fake-upstream.ts';
import { plainRequest } from '../fixtures/request-capability.ts';

test('raw HTTP and business 429 establish shared cooldown using the Effect clock', async () => {
  for (const mode of ['http429', 'business429'] as const) {
    const fake = createFakeUpstream(1);
    const runtime = { governor: new TrafficGovernor() };
    fake.setMode(mode);
    try {
      await runEffect(
        Effect.gen(function* () {
          const first = yield* Effect.result(
            transportEffect('https://music.163.com/api/first', {
              runtime,
              fetcher: fake.fetcher,
              identity: 'first',
            }),
          );
          expect(Result.isFailure(first)).toBe(true);
          if (Result.isFailure(first)) {
            expect(first.failure).toBeInstanceOf(UpstreamRateLimited);
            expect(first.failure).toMatchObject({
              status: 429,
              retryAfterMs: 1_000,
            });
          }
          fake.setMode('healthy');
          const rejected = yield* Effect.result(
            transportEffect('https://music.163.com/api/second', {
              runtime,
              fetcher: fake.fetcher,
              identity: 'second',
            }),
          );
          expect(Result.isFailure(rejected)).toBe(true);
          expect(fake.metrics.calls).toBe(1);
          yield* TestClock.adjust('1 second');
          yield* transportEffect('https://music.163.com/api/third', {
            runtime,
            fetcher: fake.fetcher,
            identity: 'second',
          });
        }),
        TestClock.layer(),
      );
      expect(fake.metrics.calls).toBe(2);
      expect(runtime.governor.snapshot.active).toBe(0);
    } finally {
      await fake.stop();
    }
  }
});

test.each(['text/plain', 'text/html', ''])(
  'raw business 429 cools the host without a JSON content type (%s)',
  async (contentType) => {
    const runtime = { governor: new TrafficGovernor() };
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return new Response('{"code":429}', {
        headers: contentType ? { 'Content-Type': contentType } : {},
      });
    };
    const first = plainRequest({ fetcher, cookie: 'MUSIC_A=first' }, runtime);
    const second = plainRequest({ fetcher, cookie: 'MUSIC_A=second' }, runtime);
    expect(first('https://music.163.com/raw/first')).rejects.toMatchObject({
      status: 429,
    });
    expect(second('https://music.163.com/raw/second')).rejects.toMatchObject({
      status: 429,
    });
    expect(calls).toBe(1);
    expect(runtime.governor.snapshot.cooldownHits).toBe(1);
    expect(runtime.governor.snapshot.active).toBe(0);
  },
);

test('a local multipart upload stops after the first cancelled part', async () => {
  const fake = createFakeUpstream(1);
  const runtime = {
    governor: new TrafficGovernor({
      maxInFlight: 8,
      maxWaiting: 32,
      waitMs: 2_000,
      hostRate: 1_000,
      hostBurst: 1_000,
      identityRate: 1_000,
      identityBurst: 1_000,
    }),
  };
  const controller = new AbortController();
  let parts = 0;
  const process = {
    ...resolveProcessServices(runtime),
    governor: runtime.governor,
  };
  try {
    const failure = await runCall(
      {
        identifier: 'voice_upload',
        input: {
          songFile: {
            data: new Uint8Array(10 * 1024 * 1024 + 1),
            name: 'local.mp3',
            size: 10 * 1024 * 1024 + 1,
            mimetype: 'audio/mpeg',
          },
        },
        signal: controller.signal,
        config: {
          cookie: 'MUSIC_U=local-upload',
          crypto: 'api',
          fetcher: async (url, init) => {
            const response = await fake.fetcher(url, init);
            const address =
              typeof url === 'string'
                ? url
                : url instanceof URL
                  ? url.href
                  : url.url;
            if (address.includes('partNumber=')) {
              parts += 1;
              controller.abort();
            }
            return response;
          },
        },
      },
      buildCallServices(process),
      {
        identifier: 'voice_upload',
        route: '/voice/upload',
        decodeInput: decodeLegacyModuleInput,
        execute: voiceUpload,
      },
    ).catch((error: unknown) => error);
    expect(failure).toMatchObject({
      status: 499,
      body: { partialCompletion: true },
    });
    expect(parts).toBe(1);
    expect(fake.metrics.calls).toBe(3);
    expect(runtime.governor.snapshot.active).toBe(0);
    expect(runtime.governor.snapshot.waiting).toBe(0);
  } finally {
    await fake.stop();
  }
});
