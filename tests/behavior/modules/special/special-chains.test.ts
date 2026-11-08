import { expect, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import packageJson from '../../../../package.json';
import { buildCallServices, runCall } from '../../../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../../../src/core/module-input.ts';
import { toModuleResponse } from '../../../../src/core/response.ts';
import { setRuntimeState } from '../../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { sdkModuleRegistry } from '../../../../src/sdk/generated/registry.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../../src/types/generated/module-surface.generated.ts';
import { settle } from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type { WireRequest } from '../../../_kit/upstream/scenario.ts';
import {
  readEapiBody,
  readWebBody,
  readWireRequest,
} from '../../../_kit/upstream/wire.ts';
import recorded from '../../../fixtures/requests/special-chains.json';

setRuntimeState({ deviceId: 'special-device', cnIp: '127.0.0.1' });
interface Wire {
  url: string;
  path: string;
  method: string;
  protocol: string;
  headers: Record<string, string>;
  data?: Record<string, unknown>;
  bodyHex?: string;
  response: unknown;
}
interface Case {
  module: string;
  label: string;
  method: string;
  query: Record<string, unknown>;
  wires: Array<Wire>;
  result: { resolved?: NcmApiResponse; rejected?: NcmApiResponse };
}
const baseline = recorded as unknown as { cases: Array<Case> };
const expectedResult = (entry: Case): Case['result'] =>
  entry.module === 'inner_version'
    ? {
        resolved: {
          status: 200,
          cookie: [],
          body: { code: 200, data: { version: packageJson.version } },
        },
      }
    : entry.result;
const cookie =
  'MUSIC_U=synthetic-account; MUSIC_A=synthetic-anonymous; __csrf=csrf; deviceId=special-device';
const revive = (entry: Case) => {
  const input = structuredClone(entry.query);
  for (const name of ['songFile', 'imgFile']) {
    const file = input[name] as { data: Array<number> } | undefined;
    if (file) input[name] = { ...file, data: new Uint8Array(file.data) };
  }
  return input;
};
const checkWire = async (expected: Wire, wire: WireRequest, token?: string) => {
  expect(wire.url).toBe(expected.url);
  expect(wire.method).toBe(expected.method);
  let projectedCookie: Record<string, string> = {};
  for (const [name, value] of Object.entries(expected.headers)) {
    if (name === 'cookie') {
      const [actualCookie, expectedCookie] = [
        wire.headers.get(name)!,
        value,
      ].map((text) =>
        Object.fromEntries(
          text.split('; ').map((part) => {
            const index = part.indexOf('=');
            return [
              part.slice(0, index),
              decodeURIComponent(part.slice(index + 1)),
            ];
          }),
        ),
      );
      // #122 changes only identity; the original orchestration fixture remains immutable.
      const wanted = expectedCookie!;
      for (const key of [
        'os',
        'appver',
        'channel',
        'osver',
        'buildver',
        'mobilename',
        'versioncode',
        'resolution',
      ])
        delete wanted[key];
      Object.assign(
        wanted,
        expected.protocol === 'weapi'
          ? { os: 'web' }
          : expected.url.includes('clientlog.music.163.com')
            ? {
                os: 'osx',
                osver: '15.5',
                appver: '3.1.10.5100',
                channel: 'netease',
              }
            : {
                os: 'iPhone OS',
                osver: '16.2',
                appver: '9.0.90',
                channel: 'distribution',
              },
      );
      projectedCookie = wanted;
      expect(actualCookie).toEqual(wanted);
    } else
      expect(wire.headers.get(name)).toBe(
        name === 'user-agent' &&
          expected.url.includes('clientlog.music.163.com')
          ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
          : value,
      );
  }
  expect(wire.headers.get('x-aeapi')).toBeNull();
  expect(wire.headers.get('X-antiCheatToken')).toBe(token ?? null);
  if (expected.protocol === 'plain') {
    expect(wire.headers.get('cookie')).toBeNull();
    expect(wire.headers.get('user-agent')).toBeNull();
    expect(
      Buffer.from(await wire.request.clone().arrayBuffer()).toString('hex'),
    ).toBe(expected.bodyHex!);
  } else {
    const decoded = (
      expected.protocol === 'eapi'
        ? readEapiBody(wire.body).data
        : readWebBody(wire.body)
    ) as Record<string, unknown>;
    if (expected.protocol === 'eapi')
      expect(readEapiBody(wire.body).path).toBe(expected.path);
    if (decoded.dupkey) {
      expect(decoded.dupkey).toMatch(/^[a-f0-9-]{36}$/);
      decoded.dupkey = '<uuid>';
    }
    const wanted = structuredClone(expected.data!);
    if (expected.protocol === 'eapi') wanted.header = projectedCookie;
    if (token) {
      wanted.checkToken = token;
      if (expected.protocol === 'eapi')
        (wanted.header as Record<string, unknown>)['X-antiCheatToken'] = token;
    }
    expect(decoded).toEqual(wanted);
  }
};
const response = (wire: Wire) =>
  typeof wire.response === 'string'
    ? new Response(wire.response, { headers: { etag: 'synthetic-etag' } })
    : Response.json(wire.response, { headers: { etag: 'synthetic-etag' } });
const normalize = (result: Case['result']) => {
  const copy = structuredClone(result);
  const body = copy.resolved?.body as { data?: { qrurl?: string } } | undefined;
  if (typeof body?.data?.qrurl === 'string')
    body.data.qrurl = body.data.qrurl.replace(
      /chainId=.*/,
      'chainId=<generated>',
    );
  return copy;
};
for (const entry of baseline.cases) {
  test(`special client ${entry.module}/${entry.label} preserves full baseline orchestration`, async () => {
    await withScenario(
      entry.wires.map((wire) => ({
        url: wire.url,
        method: wire.method,
        response: () => response(wire),
      })),
      async (scenario) => {
        const config: ModuleCallConfig = {
          cookie:
            cookie +
            '; os=android; appver=conflict; channel=conflict; osver=conflict; OS=conflict; APPVER=conflict; CHANNEL=conflict; OSVER=conflict',
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: () => testEntropy(1700000000000),
          }),
        );
        const call = client[entry.method as keyof typeof client] as (
          input: unknown,
        ) => Promise<NcmApiResponse>;
        expect(normalize(await settle(call(revive(entry))))).toEqual(
          expectedResult(entry),
        );
        expect(scenario.sent).toHaveLength(entry.wires.length);
        for (const [index, wire] of scenario.sent.entries())
          await checkWire(entry.wires[index]!, wire);
      },
    );
  });
  // SDK-only precomputed hashes/sizes are absent from the HTTP multipart parser.
  if ((entry.query.songFile as { md5?: string } | undefined)?.md5 !== undefined)
    continue;
  test(`special HTTP ${entry.module}/${entry.label} discovers the complete chain`, async () => {
    await withScenario(
      entry.wires.map((wire) => ({
        url: wire.url,
        method: wire.method,
        response: () => response(wire),
      })),
      async (scenario) => {
        const app = await createServer(
          {},
          {
            execution: {
              fetcher: scenario.fetcher,
              entropy: () => testEntropy(1700000000000),
            },
          },
        );
        const files = ['songFile', 'imgFile'].filter(
          (name) => entry.query[name],
        );
        const headers: Record<string, string> = { cookie };
        let body: FormData | string;
        if (files.length) {
          const form = new FormData();
          for (const [name, value] of Object.entries(entry.query)) {
            if (files.includes(name)) {
              const file = value as {
                data: Array<number>;
                name: string;
                mimetype: string;
              };
              form.set(
                name,
                new File([new Uint8Array(file.data)], file.name, {
                  type: file.mimetype,
                }),
              );
            } else form.set(name, String(value));
          }
          body = form;
        } else {
          headers['content-type'] = 'application/json';
          body = JSON.stringify(entry.query);
        }
        const result = await app.request(
          generatedModuleRoutes[
            entry.module as keyof typeof generatedModuleRoutes
          ],
          { method: 'POST', headers, body },
        );
        const actual = normalize({
          resolved: {
            status: result.status,
            cookie: [],
            body: (await result.json()) as NcmApiResponse['body'],
          },
        }).resolved!;
        const wanted = expectedResult(entry);
        const expected = wanted.resolved ?? wanted.rejected!;
        expect(actual.status).toBe(expected.status);
        expect(actual.body).toEqual(expected.body);
        expect(scenario.sent).toHaveLength(entry.wires.length);
        for (const [index, wire] of scenario.sent.entries())
          await checkWire(
            (
              baseline.cases.find(
                (candidate) =>
                  candidate.module === entry.module &&
                  candidate.label === entry.label + '-http-form',
              ) ?? entry
            ).wires[index]!,
            wire,
          );
      },
    );
  });
}

for (const entry of baseline.cases.filter((candidate) =>
  [
    'default',
    'file',
    'upload-True-md5-False',
    'business-512',
    'qr-16',
    'fingerprint-0',
    'id-17',
  ].includes(candidate.label),
)) {
  test(`special ${entry.module}/${entry.label} takes tokens per approved request only`, async () => {
    let providers = 0;
    await withScenario(
      entry.wires.map((wire) => ({
        url: wire.url,
        method: wire.method,
        response: () => response(wire),
      })),
      async (scenario) => {
        const config = {
          cookie,
          checkToken: async () => `special-token-${++providers}`,
        };
        const services = buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: () => testEntropy(1700000000000),
        });
        const client = createClientFromContext(config, services);
        const call = client[entry.method as keyof typeof client] as (
          input: unknown,
        ) => Promise<NcmApiResponse>;
        expect(normalize(await settle(call(revive(entry))))).toEqual(
          expectedResult(entry),
        );
        let expectedTokens = 0;
        for (const [index, wire] of scenario.sent.entries()) {
          const approved = [
            'music.163.com',
            'interface.music.163.com',
            'clientlog.music.163.com',
          ].includes(new URL(wire.url).hostname);
          await checkWire(
            entry.wires[index]!,
            wire,
            approved ? `special-token-${++expectedTokens}` : undefined,
          );
        }
        expect(providers).toBe(expectedTokens);
        expect(services.reads.snapshot).toMatchObject({
          inflight: 0,
          merged: 0,
          cacheHits: 0,
        });
      },
    );
  });
  if (entry.wires.length < 2) continue;
  for (const failureIndex of entry.wires.keys()) {
    test(`special ${entry.module}/${entry.label} stops at failed stage ${failureIndex}`, async () => {
      const stages = entry.wires.slice(0, failureIndex + 1);
      await withScenario(
        stages.map((wire, index) => ({
          url: wire.url,
          method: wire.method,
          response: () =>
            index === failureIndex
              ? Response.json({ code: 403 }, { status: 403 })
              : response(wire),
        })),
        async (scenario) => {
          const config = {
            cookie,
            retry: { retries: 5, retryNonIdempotent: true, backoffMs: 0 },
          };
          const client = createClientFromContext(
            config,
            buildCallServices(config, false, { fetcher: scenario.fetcher }),
          );
          const call = client[entry.method as keyof typeof client] as (
            input: unknown,
          ) => Promise<NcmApiResponse>;
          const result = await settle(call(revive(entry)));
          expect(result).toHaveProperty('rejected.status', 403);
          if (
            failureIndex &&
            [
              'avatar_upload',
              'playlist_cover_update',
              'cloud',
              'voice_upload',
            ].includes(entry.module)
          )
            expect(result).toMatchObject({
              rejected: {
                body: {
                  partialCompletion: true,
                  completedStages: failureIndex,
                },
              },
            });
          expect(scenario.sent).toHaveLength(stages.length);
        },
      );
    });
  }
}

for (const entry of baseline.cases.filter(
  (candidate) =>
    ['default', 'file', 'upload-True-md5-False', 'business-512'].includes(
      candidate.label,
    ) && candidate.wires.length > 1,
)) {
  for (const [stageIndex, selected] of entry.wires.entries()) {
    for (const mode of ['cancel', 'deadline'] as const) {
      for (const phase of selected.protocol === 'plain'
        ? (['body'] as const)
        : (['provider', 'body'] as const)) {
        test(`special ${entry.module}/${entry.label} ${mode} at ${stageIndex} ${phase} stops the complete chain`, async () => {
          await runEffect(
            Effect.scoped(
              Effect.gen(function* () {
                const clock = yield* TestClock.make();
                const reached = createStage('special paused phase');
                const controller = new AbortController();
                let finish!: (value: string) => void;
                let sends = 0;
                let providers = 0;
                let cancelled = 0;
                const tokenPosition = entry.wires
                  .slice(0, stageIndex + 1)
                  .filter((wire) => wire.protocol !== 'plain').length;
                const config = {
                  cookie,
                  timeoutMs: 100,
                  checkToken:
                    phase === 'provider'
                      ? () => {
                          providers++;
                          return providers === tokenPosition
                            ? new Promise<string>((resolve) => {
                                finish = resolve;
                                reached.reach();
                              })
                            : Promise.resolve(`early-${providers}`);
                        }
                      : undefined,
                };
                const services = buildCallServices(config, false, {
                  clock,
                  entropy: () => testEntropy(1700000000000),
                  fetcher: async (input, init) => {
                    const wire = entry.wires[sends++]!;
                    const url =
                      input instanceof Request ? input.url : String(input);
                    expect(url).toBe(wire.url);
                    expect(init?.method).toBe(wire.method);
                    if (sends - 1 !== stageIndex) {
                      return response(wire);
                    }
                    expect(phase).toBe('body');
                    return new Response(
                      new ReadableStream<Uint8Array>(
                        {
                          pull: () => reached.reach(),
                          cancel: () => {
                            cancelled++;
                          },
                        },
                        { highWaterMark: 0 },
                      ),
                      { headers: { 'content-type': 'application/json' } },
                    );
                  },
                });
                const client = createClientFromContext(config, services);
                const call = client[entry.method as keyof typeof client] as (
                  query: unknown,
                  config: ModuleCallConfig,
                ) => Promise<NcmApiResponse>;
                const pending = settle(
                  call(revive(entry), { signal: controller.signal }),
                );
                yield* Effect.promise(() => reached.wait(pending));
                if (mode === 'cancel') controller.abort();
                else yield* clock.adjust(100);
                const result = yield* Effect.promise(() => pending);
                expect(result).toHaveProperty(
                  'rejected.status',
                  mode === 'cancel' ? 499 : 504,
                );
                if (phase === 'provider') {
                  finish('late-token');
                  yield* Effect.yieldNow;
                }
                expect(sends).toBe(stageIndex + (phase === 'body' ? 1 : 0));
                expect(cancelled).toBe(phase === 'body' ? 1 : 0);
                expect(services.reads.snapshot.inflight).toBe(0);
              }),
            ),
          );
        });
      }
    }
  }
}

for (const entry of baseline.cases.filter((candidate) =>
  [
    'default',
    'file',
    'upload-True-md5-False',
    'business-512',
    'fingerprint-0',
    'id-17',
  ].includes(candidate.label),
)) {
  for (const [stageIndex, selected] of entry.wires.entries()) {
    for (const failure of ['EAI_AGAIN', 'socket hang up']) {
      test(`special ${entry.module}/${entry.label} stage ${stageIndex} preserves ${failure} retry limit`, async () => {
        const read = [
          '/api/v6/playlist/detail',
          '/api/v3/song/detail',
        ].includes(selected.path);
        const connect =
          selected.protocol === 'plain' &&
          selected.method === 'GET' &&
          entry.module === 'cloud';
        const attempts = read ? 2 : connect && failure === 'EAI_AGAIN' ? 3 : 1;
        await withScenario(
          entry.wires.slice(0, stageIndex + 1).map((wire, index) => ({
            url: wire.url,
            method: wire.method,
            times: index === stageIndex ? attempts : 1,
            reject: index === stageIndex ? new Error(failure) : undefined,
            response: () => response(wire),
          })),
          async (scenario) => {
            const config = {
              cookie,
              retry: {
                retries: 1,
                retryNonIdempotent: true,
                backoffMs: 0,
                jitter: false,
              },
            };
            const services = buildCallServices(config, false, {
              fetcher: scenario.fetcher,
            });
            const client = createClientFromContext(config, services);
            const call = client[entry.method as keyof typeof client] as (
              query: unknown,
            ) => Promise<NcmApiResponse>;
            expect(await settle(call(revive(entry)))).toHaveProperty(
              'rejected.status',
              502,
            );
            expect(scenario.sent).toHaveLength(stageIndex + attempts);
            expect(services.reads.snapshot.inflight).toBe(0);
          },
        );
      });
    }
  }
}

for (const secondCode of [200, 512, 403]) {
  test(`special tracks business 512 sends exactly one fallback ending ${secondCode}`, async () => {
    const entry = baseline.cases.find(
      (candidate) => candidate.label === 'business-512',
    )!;
    await withScenario(
      entry.wires.map((wire, index) => ({
        url: wire.url,
        method: wire.method,
        response: () => Response.json({ code: index === 0 ? 512 : secondCode }),
      })),
      async (scenario) => {
        const config = { cookie };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        const outcome = await settle(
          client.playlistTracks({ op: 'add', pid: 19, tracks: '17,23' }),
        );
        expect(outcome).toHaveProperty(
          secondCode === 200 ? 'resolved.status' : 'rejected.status',
          secondCode === 200 ? 200 : secondCode,
        );
        expect(readEapiBody(scenario.sent[0]!.body).data).toMatchObject({
          trackIds: '["17","23"]',
        });
        expect(readEapiBody(scenario.sent[1]!.body).data).toMatchObject({
          trackIds: '["17","23","17","23"]',
        });
        expect(scenario.sent).toHaveLength(2);
      },
    );
  });
}

for (const module of [
  'cloud_import',
  'playlist_track_all',
  'scrobble',
  'avatar_upload',
  'voice_upload',
] as const) {
  test(`special ${module} refuses a second API use of a fixed token`, async () => {
    const entry = baseline.cases.find(
      (candidate) =>
        candidate.module === module && candidate.label === 'default',
    )!;
    let api = 0;
    const prefix = entry.wires.filter((wire) => {
      if (wire.protocol !== 'plain') api++;
      return api < 2;
    });
    await withScenario(
      prefix.map((wire) => ({
        url: wire.url,
        method: wire.method,
        response: () => response(wire),
      })),
      async (scenario) => {
        const config = { cookie, checkToken: 'one-api-token' };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, { fetcher: scenario.fetcher }),
        );
        const call = client[entry.method as keyof typeof client] as (
          query: unknown,
        ) => Promise<NcmApiResponse>;
        expect(await settle(call(revive(entry)))).toHaveProperty(
          'rejected.status',
          400,
        );
        expect(scenario.sent).toHaveLength(prefix.length);
      },
    );
  });
}

for (const size of [0, 10 * 1024 * 1024 + 1]) {
  test(`special voice ${size} bytes preserves actual multipart bytes and ETag order`, async () => {
    const entry = baseline.cases.find(
      (candidate) =>
        candidate.module === 'voice_upload' && candidate.label === 'default',
    )!;
    const bytes = new Uint8Array(size).fill(127);
    const stages = [
      ...entry.wires.slice(0, 2),
      ...Array.from(
        { length: Math.ceil(size / (10 * 1024 * 1024)) },
        (_, index) => ({
          ...entry.wires[2]!,
          url: entry.wires[2]!.url.replace(
            'partNumber=1',
            `partNumber=${index + 1}`,
          ),
        }),
      ),
      ...entry.wires.slice(3),
    ];
    let part = 0;
    await withScenario(
      stages.map((wire) => ({
        url: wire.url,
        method: wire.method,
        check: (actual) => {
          if (wire.protocol === 'plain') {
            expect(actual.headers.get('cookie')).toBeNull();
            expect(actual.headers.get('X-antiCheatToken')).toBeNull();
          }
        },
        response: async (actual) => {
          if (wire.method === 'PUT') {
            const data = new Uint8Array(
              await actual.request.clone().arrayBuffer(),
            );
            expect(data).toEqual(
              bytes.subarray(
                part * 10 * 1024 * 1024,
                (part + 1) * 10 * 1024 * 1024,
              ),
            );
            return new Response('', { headers: { etag: `etag-${++part}` } });
          }
          if (actual.url.includes('?uploadId='))
            expect(actual.body).toBe(
              `<CompleteMultipartUpload>${Array.from({ length: part }, (_, index) => `<Part><PartNumber>${index + 1}</PartNumber><ETag>etag-${index + 1}</ETag></Part>`).join('')}</CompleteMultipartUpload>`,
            );
          return response(wire);
        },
      })),
      async (scenario) => {
        const config = { cookie };
        const services = buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        });
        const client = createClientFromContext(config, services);
        const input = revive(entry) as NonNullable<
          Parameters<typeof client.voiceUpload>[0]
        >;
        expect(
          (
            await client.voiceUpload({
              ...input,
              songFile: { ...input.songFile!, data: bytes, size },
            })
          ).status,
        ).toBe(200);
        expect(part).toBe(size ? 2 : 0);
        expect(scenario.sent).toHaveLength(size ? 7 : 5);
        expect(services.reads.snapshot.inflight).toBe(0);
      },
    );
  });
}

test('special cloud import freezes distinct accounts inputs tokens and dependent results', async () => {
  const paused = createStage('first import token');
  let finish!: (value: string) => void;
  const firstCookie = { MUSIC_U: 'account-A', deviceId: 'old-A' };
  const firstState = { deviceId: 'device-A' };
  const firstInput = { id: 17, md5: 'md5-A', song: 'song-A' };
  const seen: Array<{
    account: string | undefined;
    data: Record<string, unknown>;
  }> = [];
  const config = { cookie };
  const services = buildCallServices(config, false, {
    entropy: testEntropy,
    fetcher: async (input, init) => {
      const wire = await readWireRequest(input, init);
      const { path, data } = readEapiBody(wire.body) as {
        path: string;
        data: Record<string, unknown>;
      };
      const header = data.header as Record<string, string>;
      const account = header.MUSIC_U;
      expect(header.deviceId).toBe(
        account === 'account-A' ? 'device-A' : 'device-B',
      );
      expect(wire.headers.get('X-antiCheatToken')).toMatch(
        account === 'account-A' ? /^A-token-[12]$/ : /^B-token-[12]$/,
      );
      seen.push({ account, data });
      expect(account).toBeOneOf(['account-A', 'account-B']);
      const songs = JSON.parse(String(data.songs));
      if (path.endsWith('/check/v2')) {
        expect(songs[0]).toMatchObject(
          account === 'account-A'
            ? { md5: 'md5-A', songId: 17 }
            : { md5: 'md5-B', songId: 19 },
        );
        return Response.json({
          code: 200,
          data: [{ songId: account === 'account-A' ? 117 : 119 }],
        });
      }
      expect(path).toBe('/api/cloud/user/song/import');
      expect(songs[0]).toMatchObject(
        account === 'account-A'
          ? { songId: 117, song: 'song-A' }
          : { songId: 119, song: 'song-B' },
      );
      return Response.json({ code: 200, owner: account });
    },
  });
  const client = createClientFromContext(config, services);
  let firstTokens = 0;
  const first = client.cloudImport(firstInput, {
    cookie: firstCookie,
    state: firstState,
    checkToken: () =>
      ++firstTokens === 1
        ? new Promise<string>((resolve) => {
            finish = resolve;
            paused.reach();
          })
        : Promise.resolve('A-token-2'),
  });
  await paused.wait(first);
  firstCookie.MUSIC_U = 'changed';
  firstCookie.deviceId = 'changed';
  firstState.deviceId = 'changed';
  firstInput.id = 29;
  firstInput.md5 = 'changed';
  firstInput.song = 'changed';
  let secondTokens = 0;
  const second = await client.cloudImport(
    { id: 19, md5: 'md5-B', song: 'song-B' },
    {
      cookie: 'MUSIC_U=account-B; deviceId=old-B',
      state: { deviceId: 'device-B' },
      checkToken: async () => `B-token-${++secondTokens}`,
    },
  );
  finish('A-token-1');
  expect((await first).body).toMatchObject({ owner: 'account-A' });
  expect(second.body).toMatchObject({ owner: 'account-B' });
  expect(seen.map((entry) => entry.data.checkToken)).toEqual([
    'B-token-1',
    'B-token-2',
    'A-token-1',
    'A-token-2',
  ]);
  expect(firstTokens).toBe(2);
  expect(secondTokens).toBe(2);
  expect(services.reads.snapshot).toMatchObject({
    inflight: 0,
    merged: 0,
    cacheHits: 0,
  });
});

test('special multi-request total deadline does not restart at the second provider', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const firstReached = createStage('first response');
        const secondReached = createStage('second provider');
        let release!: (value: Response) => void;
        let finish!: (value: string) => void;
        let providers = 0;
        let sends = 0;
        let settled = false;
        const config = {
          cookie,
          timeoutMs: 100,
          checkToken: () =>
            ++providers === 1
              ? Promise.resolve('first')
              : new Promise<string>((resolve) => {
                  finish = resolve;
                  secondReached.reach();
                }),
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            clock,
            fetcher: async () => {
              sends++;
              return new Promise<Response>((resolve) => {
                release = resolve;
                firstReached.reach();
              });
            },
          }),
        );
        const pending = settle(client.cloudImport({ id: 17 })).then((value) => {
          settled = true;
          return value;
        });
        yield* Effect.promise(() => firstReached.wait(pending));
        yield* clock.adjust(60);
        release(Response.json({ code: 200, data: [{ songId: 117 }] }));
        yield* Effect.promise(() => secondReached.wait(pending));
        yield* clock.adjust(39);
        expect(settled).toBe(false);
        yield* clock.adjust(1);
        const finalResult = yield* Effect.promise(() => pending);
        expect(finalResult).toHaveProperty('rejected.status', 504);
        finish('late');
        yield* Effect.yieldNow;
        expect(sends).toBe(1);
        expect(providers).toBe(2);
      }),
    ),
  );
});

const dynamicPlainActions = {
  match: {
    profile: 'plainInterface',
    target: { prefix: '/api/music/audio/match' },
    semantic: 'read',
    cache: 'none',
    retry: 'never',
    method: 'GET',
    response: 'json',
  },
} as const;

test('special dynamic plain accepts its declared origin and target', async () => {
  let providers = 0;
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/music/audio/match',
        method: 'GET',
        headers: { 'X-antiCheatToken': 'plain-token' },
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const outcome = await runCall(
        {
          identifier: 'plain-boundary',
          input: {},
          config: {
            cookie,
            checkToken: async () => {
              providers++;
              return 'plain-token';
            },
          },
        },
        buildCallServices({}, false, { fetcher: scenario.fetcher }),
        {
          ...sdkModuleRegistry.audio_match,
          actions: dynamicPlainActions,
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            request('match', {
              target: 'https://interface.music.163.com/api/music/audio/match',
            }).pipe(Effect.map(toModuleResponse)),
        },
      );
      expect(outcome.status).toBe(200);
      expect(providers).toBe(1);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

for (const change of [
  { target: 'https://music.163.com/api/music/audio/match' },
  { target: 'https://interface.music.163.com/api/music/escape' },
  { target: 'https://interface.music.163.com:444/api/music/audio/match' },
  { target: 'https://interface.music.163.com/api/music/audio/match#fragment' },
  { target: 'https://user:pass@interface.music.163.com/api/music/audio/match' },
  { method: 'POST' as const },
  { response: 'text' as const },
]) {
  test(`special plain declaration rejects ${JSON.stringify(change)} before provider or network`, async () => {
    let providers = 0;
    await withScenario([], async (scenario) => {
      const config = {
        cookie,
        checkToken: async () => {
          providers++;
          return 'never-sent';
        },
      };
      const outcome = await settle(
        runCall(
          { identifier: 'audio_match', input: {}, config },
          buildCallServices(config, false, { fetcher: scenario.fetcher }),
          {
            ...sdkModuleRegistry.audio_match,
            actions: dynamicPlainActions,
            decodeInput: decodeLegacyModuleInput,
            execute: (_input, request) =>
              // 模拟 JavaScript 调用者绕过类型检查，验证运行时仍拒绝非法参数。
              request('match', {
                target: 'https://interface.music.163.com/api/music/audio/match',
                headers: {},
                ...change,
              } as never).pipe(Effect.map(toModuleResponse)),
          },
        ),
      );
      expect(outcome).toHaveProperty('rejected.status', 400);
      expect(scenario.sent).toHaveLength(0);
      expect(providers).toBe(0);
    });
  });
}

test('special local modules declare an empty action set', () => {
  expect(sdkModuleRegistry.inner_version.actions).toEqual({});
  expect(sdkModuleRegistry.login_qr_create.actions).toEqual({});
});

for (const module of new Set(baseline.cases.map((entry) => entry.module))) {
  const entry = baseline.cases.find(
    (candidate) =>
      candidate.module === module && candidate.result.resolved?.status === 200,
  )!;
  test(`special ${module} never shares or caches calls with an explicit read store TTL`, async () => {
    await withScenario(
      entry.wires.map((wire) => ({
        url: wire.url,
        method: wire.method,
        times: 4,
        response: () => response(wire),
      })),
      async (scenario) => {
        const config = { cookie, cache: { ttlMs: 60000 } };
        const services = buildCallServices(config, false, {
          fetcher: scenario.fetcher,
        });
        const client = createClientFromContext(config, services);
        const call = client[entry.method as keyof typeof client] as (
          query: unknown,
        ) => Promise<NcmApiResponse>;
        const first = await Promise.all([
          call(revive(entry)),
          call(revive(entry)),
        ]);
        const next = await call(revive(entry));
        await call(revive(entry));
        expect([...first, next].map((result) => result.status)).toEqual([
          200, 200, 200,
        ]);
        expect(scenario.sent).toHaveLength(entry.wires.length * 4);
        expect(services.reads.snapshot).toMatchObject({
          inflight: 0,
          merged: 0,
          cacheHits: 0,
        });
      },
    );
  });
}

for (const uploadBase of [
  'https://outside.example',
  'https://music.163.com',
  'http://nosup-hz1.127.net',
  'https://nosup-hz1.127.net:444',
  'https://nosup-hz1.127.net/other',
]) {
  test(`special cloud rejects allocated upload destination ${uploadBase} without forwarding credentials`, async () => {
    const entry = baseline.cases.find(
      (candidate) =>
        candidate.module === 'cloud' &&
        candidate.label === 'upload-True-md5-False',
    )!;
    let providers = 0;
    await withScenario(
      entry.wires.slice(0, 4).map((wire, index) => ({
        url: wire.url,
        method: wire.method,
        response: () =>
          index === 3
            ? Response.json({ upload: [uploadBase] })
            : response(wire),
      })),
      async (scenario) => {
        const config = {
          cookie,
          checkToken: async () => `upload-API-${++providers}`,
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, { fetcher: scenario.fetcher }),
        );
        const result = await settle(
          client.cloud(revive(entry) as Parameters<typeof client.cloud>[0]),
        );
        expect(result).toHaveProperty('rejected.status', 400);
        expect(scenario.sent).toHaveLength(4);
        expect(providers).toBe(3);
      },
    );
  });
}

for (const entry of [
  {
    module: 'audio_match',
    input: { audioFP: 'upload', duration: 3 },
    url: 'https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=3&rawdata=upload&times=1&decrypt=1',
    method: 'audioMatch',
  },
  {
    module: 'related_playlist',
    input: { id: 'login' },
    url: 'https://music.163.com/playlist?id=login',
    method: 'relatedPlaylist',
  },
]) {
  test(`special ${entry.module} preserves the old dynamic URL no-retry upper limit`, async () => {
    await withScenario(
      [
        {
          url: entry.url,
          method: 'GET',
          reject: new Error('EAI_AGAIN'),
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        const config = {
          cookie,
          retry: {
            backoffMs: 0,
            jitter: false,
            retryNonIdempotent: true,
            retries: 5,
          },
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, { fetcher: scenario.fetcher }),
        );
        const call = client[entry.method as keyof typeof client] as (
          input: unknown,
        ) => Promise<NcmApiResponse>;
        expect(await settle(call(entry.input))).toHaveProperty(
          'rejected.status',
          502,
        );
        expect(scenario.sent).toHaveLength(1);
      },
    );
  });
}

for (const selection of [
  { module: 'avatar_upload', label: 'default' },
  { module: 'playlist_cover_update', label: 'file' },
  { module: 'cloud', label: 'upload-True-md5-False' },
]) {
  test(`special ${selection.module} accepts opaque NOS bytes before submitting`, async () => {
    const entry = baseline.cases.find(
      (candidate) =>
        candidate.module === selection.module &&
        candidate.label === selection.label,
    )!;
    let opaqueResponses = 0;
    await withScenario(
      entry.wires.map((wire) => ({
        url: wire.url,
        method: wire.method,
        response: () => {
          if (wire.protocol === 'plain' && wire.method === 'POST') {
            opaqueResponses++;
            return new Response(new Uint8Array([255, 0, 60]), {
              headers: { 'content-type': 'application/octet-stream' },
            });
          }
          return response(wire);
        },
      })),
      async (scenario) => {
        const config = { cookie };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: () => testEntropy(1700000000000),
          }),
        );
        const call = client[entry.method as keyof typeof client] as (
          query: unknown,
        ) => Promise<NcmApiResponse>;
        expect(normalize(await settle(call(revive(entry))))).toEqual(
          expectedResult(entry),
        );
        expect(opaqueResponses).toBe(1);
        expect(scenario.sent).toHaveLength(entry.wires.length);
        expect(scenario.sent.at(-1)!.url).toBe(entry.wires.at(-1)!.url);
      },
    );
  });
}
