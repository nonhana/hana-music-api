import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Effect, Option } from 'effect';

import { startServer } from '../src/app/cli.ts';
import { Call, CallServices, ProcessServices } from '../src/core/call.ts';
import { decodeLegacyModuleInput } from '../src/core/module-input.ts';
import type { ReadStore } from '../src/core/read-store.ts';
import { requestEffect } from '../src/core/request.ts';
import { TrafficGovernor } from '../src/core/traffic.ts';
import avatarUpload, {
  decodeModuleInput as decodeAvatarInput,
} from '../src/modules/avatar_upload.ts';
import like from '../src/modules/like.ts';
import search, {
  decodeModuleInput as decodeSearchInput,
} from '../src/modules/search.ts';
import type {
  ModuleDefinition,
  NcmApiResponse,
  StartServerOptions,
} from '../src/types/index.ts';
import { createFakeUpstream } from '../tests/fixtures/fake-upstream.ts';
import type { FakeMode } from '../tests/fixtures/fake-upstream.ts';

interface Acceptance {
  readonly requests: number;
  readonly p95: number;
  readonly rejectedP95: number;
  readonly successes: number;
  readonly rejected: number;
  readonly cancelled: number;
  readonly timedOut: number;
  readonly normalSuccesses: number;
  readonly fastRejected: number;
  readonly pressureRejected: number;
  readonly pressureMaxMs: number;
  readonly active: number;
  readonly waiting: number;
  readonly upstreamActive: number;
  readonly inflight: number;
  readonly peakInflight: number;
  readonly peakActive: number;
  readonly peakWaiting: number;
  readonly rssGrowth: number;
}

export const assertLoadReport = (report: Acceptance): void => {
  if (
    Object.values(report).some((value) => !Number.isFinite(value)) ||
    report.successes === 0 ||
    report.rejected === 0 ||
    report.successes + report.rejected + report.cancelled + report.timedOut !==
      report.requests ||
    report.normalSuccesses === 0 ||
    report.normalSuccesses > report.successes ||
    report.fastRejected + report.pressureRejected !== report.rejected ||
    report.pressureRejected === 0 ||
    report.pressureMaxMs > 2_500 ||
    report.p95 >= 1_000 ||
    report.rejectedP95 >= 250 ||
    report.active !== 0 ||
    report.waiting !== 0 ||
    report.upstreamActive !== 0 ||
    report.inflight !== 0 ||
    report.peakInflight <= 0 ||
    report.peakActive > 8 ||
    report.peakWaiting > 32 ||
    report.rssGrowth > 0.3
  ) {
    throw new Error('Load acceptance failed');
  }
};

const check = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

export const fingerprint = async (cwd = process.cwd()) => {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  }).trim();
  const hash = createHash('sha256').update(
    execFileSync('git', ['diff', 'HEAD', '--binary'], {
      cwd,
      maxBuffer: 16 * 1024 * 1024,
    }),
  );
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '-z'],
    {
      cwd,
      encoding: 'utf8',
    },
  )
    .split('\0')
    .filter(Boolean)
    .toSorted();
  for (const path of untracked) {
    hash
      .update(path)
      .update('\0')
      .update(await readFile(resolve(cwd, path)));
  }
  return { head, diffSha256: hash.digest('hex') };
};

const percentile = (values: Array<number>, fraction: number): number =>
  values.toSorted((left, right) => left - right)[
    Math.ceil(values.length * fraction) - 1
  ] ?? 0;

const runLoad = async (soak: boolean) => {
  const revision = await fingerprint();
  const samples: Array<{
    scenario: string;
    phase: 'normal' | 'pressure';
    durationMs: number;
    status: number;
  }> = [];
  const memory: Array<{ minute: number; rss: number; heapUsed: number }> = [];
  const scenarios: Array<Record<string, unknown>> = [];
  const failures: Array<string> = [];
  const startedAt = performance.now();
  let mergeRate = 0;
  let apiExecutions = 0;
  let retries = 0;
  const moduleDefinitions: Array<ModuleDefinition> = [
    {
      identifier: 'search',
      route: '/search',
      decodeInput: decodeSearchInput,
      execute: (query, request) =>
        search(
          {
            ...query,
            keywords: typeof query.keywords === 'string' ? query.keywords : '',
          },
          request,
        ),
    },
    {
      identifier: 'like',
      route: '/like',
      decodeInput: decodeLegacyModuleInput,
      execute: like,
    },
    {
      identifier: 'avatar_upload',
      route: '/avatar/upload',
      decodeInput: decodeAvatarInput,
      execute: avatarUpload,
    },
    {
      identifier: 'raw',
      route: '/raw',
      decodeInput: decodeLegacyModuleInput,
      execute: (_query, request) =>
        request({
          target: 'https://music.163.com/raw/page',
          protocol: 'plain',
          method: 'GET',
          headers: {},
          response: 'bytes',
          semantic: 'read',
        }).pipe(Effect.as({ status: 200, cookie: [], body: { code: 200 } })),
    },
    {
      identifier: 'slow',
      route: '/slow',
      decodeInput: decodeLegacyModuleInput,
      execute: (_query, request) =>
        request({
          target: '/api/load/slow',
          protocol: 'api',
          method: 'POST',
          headers: {},
          body: '{}',
          response: 'json',
          semantic: 'read',
        }).pipe(
          Effect.map((response) => ({
            ...response,
            cookie: [...response.cookie],
          })),
          Effect.updateService(Call, (call) => ({
            ...call,
            deadlineAt: Math.min(
              call.deadlineAt ?? Infinity,
              call.startedAt + 200,
            ),
          })),
        ),
    },
  ];

  const runScenario = async (
    name: string,
    options: StartServerOptions,
    exercise: (harness: {
      call: (
        path: string,
        init?: RequestInit,
        expected?: Array<number>,
        phase?: 'normal' | 'pressure',
      ) => Promise<void>;
      fake: ReturnType<typeof createFakeUpstream>;
      cancel: () => Promise<void>;
    }) => Promise<void>,
    mode: FakeMode = 'healthy',
  ) => {
    const fake = createFakeUpstream(50);
    fake.setMode(mode);
    const governor = new TrafficGovernor();
    const readStores = new Set<ReadStore<NcmApiResponse>>();
    let peakInflight = 0;
    const { server, url } = await startServer({
      ...options,
      hostname: '127.0.0.1',
      port: 0,
      silent: true,
      moduleDefinitions,
      requestHandler: (intent) =>
        Effect.serviceOption(CallServices).pipe(
          Effect.map(Option.getOrThrow),
          Effect.flatMap(({ reads }) => {
            readStores.add(reads);
            peakInflight = Math.max(peakInflight, reads.snapshot.inflight);
            return requestEffect(intent);
          }),
          Effect.updateService(Call, (call) => ({
            ...call,
            config: {
              ...call.config,
              crypto: 'api' as const,
              fetcher: fake.fetcher,
              onRequestEvent: (event) => {
                if (event.type === 'attempt' && event.attempt === 1) {
                  apiExecutions += 1;
                }
                if (event.type === 'retry') {
                  retries += 1;
                }
              },
            },
          })),
          Effect.updateService(ProcessServices, (services) => ({
            ...services,
            governor,
          })),
        ),
    });
    const call = async (
      path: string,
      init: RequestInit = {},
      expected = [200, 429, 503],
      phase: 'normal' | 'pressure' = name === 'distinct-pressure'
        ? 'pressure'
        : 'normal',
    ) => {
      const target = new URL(path, url);
      check(
        target.hostname === '127.0.0.1' && target.port === String(server.port),
        'Load socket target must be loopback',
      );
      const begin = performance.now();
      const response = await fetch(target, { ...init, redirect: 'manual' });
      await response.text();
      samples.push({
        scenario: name,
        phase,
        durationMs: performance.now() - begin,
        status: response.status,
      });
      check(
        expected.includes(response.status),
        `${name}: unexpected HTTP ${response.status}`,
      );
    };
    const cancel = async () => {
      const controller = new AbortController();
      const begin = performance.now();
      const pending = fetch(new URL('/demo/api-debug/request', url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: '/api/load/cancel', crypto: 'api' }),
        signal: controller.signal,
      }).then(
        async (response) => {
          await response.text();
          return false;
        },
        () => true,
      );
      const until = performance.now() + 2_000;
      while (fake.metrics.calls === 0 && performance.now() < until) {
        await Bun.sleep(10);
      }
      controller.abort();
      check(await pending, 'HTTP cancellation must abort the client');
      samples.push({
        scenario: name,
        phase: 'normal',
        durationMs: performance.now() - begin,
        status: 499,
      });
    };
    try {
      await exercise({ call, fake, cancel });
      const until = performance.now() + 2_000;
      while (fake.metrics.active > 0 && performance.now() < until) {
        await Bun.sleep(10);
      }
      check(
        fake.metrics.active === 0 &&
          governor.snapshot.active === 0 &&
          governor.snapshot.waiting === 0 &&
          readStores.size === 1 &&
          [...readStores].every((reads) => reads.snapshot.inflight === 0),
        `${name}: leaked activity`,
      );
      if (mode === 'slow-body') {
        check(
          fake.metrics.cancelled === 1,
          `${name}: upstream body was not cancelled`,
        );
      }
    } finally {
      scenarios.push({
        name,
        upstream: fake.metrics,
        traffic: governor.snapshot,
        reads: {
          inflight: [...readStores].reduce(
            (sum, reads) => sum + reads.snapshot.inflight,
            0,
          ),
          peakInflight,
        },
      });
      await server.stop(true);
      await fake.stop();
    }
  };

  try {
    if (soak) {
      await runScenario(
        'soak',
        { traffic: { trustedProxyIps: ['127.0.0.1'] } },
        async ({ call }) => {
          let sequence = 0;
          for (let minute = 0; minute < 10; minute += 1) {
            const until = startedAt + (minute + 1) * 60_000;
            if (minute % 2 !== 0) {
              await Bun.sleep(2_000);
            }
            let nextAt = performance.now();
            const invoke = (index: number, phase: 'normal' | 'pressure') =>
              call(
                index % 10 === 0
                  ? `/like?id=${index}&like=true`
                  : `/search?keywords=${index}`,
                {
                  headers: {
                    cookie: `MUSIC_A=local-user-${index % 100}`,
                    'X-Forwarded-For': `10.0.0.${(index % 100) + 1}`,
                  },
                },
                undefined,
                phase,
              );
            while (performance.now() < until) {
              if (minute % 2 === 0) {
                await invoke(sequence++, 'normal');
                nextAt += 250;
              } else {
                await Promise.all(
                  Array.from({ length: 100 }, () =>
                    invoke(sequence++, 'pressure'),
                  ),
                );
                nextAt += 1_000;
              }
              await Bun.sleep(
                Math.max(0, Math.min(nextAt, until) - performance.now()),
              );
            }
            const usage = process.memoryUsage();
            memory.push({
              minute: minute + 1,
              rss: usage.rss,
              heapUsed: usage.heapUsed,
            });
            process.stderr.write(`soak minute ${minute + 1}/10\n`);
          }
        },
      );
    } else {
      await runScenario(
        'same-key',
        { traffic: { burst: 1_000, maxInFlight: 128 } },
        async ({ call, fake }) => {
          await Promise.all(
            Array.from({ length: 100 }, () =>
              call('/search?keywords=same', {}, [200]),
            ),
          );
          check(
            fake.metrics.calls === 1,
            '100 same-key reads must share one upstream call',
          );
          mergeRate = 1 - fake.metrics.calls / 100;
        },
      );
      await runScenario('default-burst', {}, async ({ call }) => {
        await Promise.all(
          Array.from({ length: 100 }, (_, index) =>
            call(`/search?keywords=${index}`),
          ),
        );
        check(
          samples.filter(
            (sample) =>
              sample.scenario === 'default-burst' && sample.status === 429,
          ).length >= 90,
          'Default ingress must reject the burst',
        );
      });
      await runScenario(
        'read-write',
        { traffic: { burst: 1_000, maxInFlight: 128 } },
        async ({ call, fake }) => {
          for (const enabled of [true, false, true]) {
            await call(`/like?id=123&like=${enabled}`, {}, [200]);
          }
          await Promise.all(
            Array.from({ length: 97 }, () =>
              call('/search?keywords=mixed', {}, [200]),
            ),
          );
          check(
            JSON.stringify(fake.metrics.writes) === '["true","false","true"]',
            'Writes must execute in order without caching or merging',
          );
          check(
            fake.metrics.calls === 4,
            'Mixed reads must merge and every write must be sent',
          );
        },
      );
      for (const mode of ['http429', 'plain429'] as const) {
        await runScenario(
          mode,
          {},
          async ({ call, fake }) => {
            await call('/raw', { headers: { cookie: 'MUSIC_A=first' } }, [429]);
            fake.setMode('healthy');
            await call(
              '/raw',
              { headers: { cookie: 'MUSIC_A=second' } },
              [429],
            );
            check(
              fake.metrics.calls === 1,
              'Host cooldown must prevent a second socket call',
            );
          },
          mode,
        );
      }
      await runScenario(
        'slow-body',
        {},
        async ({ call }) => {
          await call('/slow', {}, [504]);
        },
        'slow-body',
      );
      await runScenario(
        'cancel',
        { debugApiRequests: true },
        async ({ cancel }) => {
          await cancel();
        },
        'slow-body',
      );
      await runScenario('upload', {}, async ({ call, fake }) => {
        await Promise.all(
          Array.from({ length: 3 }, () => {
            const body = new FormData();
            body.set(
              'imgFile',
              new File([new Uint8Array(1_024)], 'local.jpg', {
                type: 'image/jpeg',
              }),
            );
            return call('/avatar/upload', { method: 'POST', body });
          }),
        );
        const statuses = samples
          .filter((sample) => sample.scenario === 'upload')
          .map((sample) => sample.status)
          .toSorted((left, right) => left - right);
        check(
          JSON.stringify(statuses) === '[200,200,503]',
          'Only two uploads may be admitted',
        );
        check(
          fake.metrics.calls === 6,
          'Both uploads must complete token, NOS and submit stages',
        );
      });
      await runScenario(
        'distinct-pressure',
        { traffic: { burst: 1_000 } },
        async ({ call, fake }) => {
          for (const count of [100, 91]) {
            await Promise.all(
              Array.from({ length: count }, (_, index) =>
                call(`/search?keywords=pressure-${count}-${index}`, {
                  headers: { cookie: `MUSIC_A=local-user-${index % 100}` },
                }),
              ),
            );
          }
          check(
            fake.metrics.peak === 8,
            'Pressure must exercise all eight outbound permits',
          );
        },
      );
      check(
        samples.length === 500,
        'Smoke must execute 500 real HTTP requests',
      );
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
  const successes = samples
    .filter((sample) => sample.status === 200)
    .map((sample) => sample.durationMs);
  const rejected = samples
    .filter((sample) => sample.status === 429 || sample.status === 503)
    .map((sample) => sample.durationMs);
  const normalSuccesses = samples
    .filter((sample) => sample.phase === 'normal' && sample.status === 200)
    .map((sample) => sample.durationMs);
  const fastRejected = samples
    .filter(
      (sample) =>
        sample.phase === 'normal' &&
        (sample.status === 429 || sample.status === 503),
    )
    .map((sample) => sample.durationMs);
  const pressure = samples.filter((sample) => sample.phase === 'pressure');
  const pressureRejected = pressure.filter(
    (sample) => sample.status === 429 || sample.status === 503,
  );
  const cancelled = samples.filter((sample) => sample.status === 499).length;
  const timedOut = samples.filter((sample) => sample.status === 504).length;
  const traffic = scenarios.map(
    (scenario) => scenario.traffic as TrafficGovernor['snapshot'],
  );
  const reads = scenarios.map(
    (scenario) => scenario.reads as { inflight: number; peakInflight: number },
  );
  const upstream = scenarios.map(
    (scenario) =>
      scenario.upstream as ReturnType<typeof createFakeUpstream>['metrics'],
  );
  const tail = memory.slice(-3);
  const acceptance = {
    requests: samples.length,
    p95: percentile(normalSuccesses, 0.95),
    rejectedP95: percentile(fastRejected, 0.95),
    successes: successes.length,
    rejected: rejected.length,
    cancelled,
    timedOut,
    normalSuccesses: normalSuccesses.length,
    fastRejected: fastRejected.length,
    pressureRejected: pressureRejected.length,
    pressureMaxMs: Math.max(0, ...pressure.map((sample) => sample.durationMs)),
    active: traffic.reduce((sum, value) => sum + value.active, 0),
    waiting: traffic.reduce((sum, value) => sum + value.waiting, 0),
    upstreamActive: upstream.reduce((sum, value) => sum + value.active, 0),
    inflight: reads.reduce((sum, value) => sum + value.inflight, 0),
    peakInflight: Math.max(0, ...reads.map((value) => value.peakInflight)),
    peakActive: Math.max(0, ...traffic.map((value) => value.peakActive)),
    peakWaiting: Math.max(0, ...traffic.map((value) => value.peakWaiting)),
    rssGrowth: tail.length
      ? Math.max(...tail.map((value) => value.rss)) / tail[0]!.rss - 1
      : 0,
  };
  try {
    assertLoadReport(acceptance);
    if (!soak) {
      check(
        fastRejected.length > 0,
        'Smoke must measure immediate overload rejection',
      );
    }
    check(
      soak
        ? cancelled === 0 && timedOut === 0
        : cancelled === 1 && timedOut === 1,
      'Unexpected cancellation or timeout count',
    );
    check(
      acceptance.peakActive === 8,
      'Run must exercise eight outbound permits',
    );
    if (soak) {
      check(
        memory.length === 10 && memory.at(-1)!.minute === 10,
        'Soak must complete ten minutes',
      );
    }
    check(
      JSON.stringify(revision) === JSON.stringify(await fingerprint()),
      'Working tree changed during load validation',
    );
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
  const durationMs = performance.now() - startedAt;
  const report = {
    mode: soak ? 'soak' : 'smoke',
    revision,
    bunVersion: Bun.version,
    platform: process.platform,
    virtualUsers: 100,
    durationMs,
    throughput: samples.length / (durationMs / 1_000),
    p50: percentile(successes, 0.5),
    p99: percentile(successes, 0.99),
    ...acceptance,
    statusCounts: Object.fromEntries(
      [...new Set(samples.map((sample) => sample.status))].map((status) => [
        status,
        samples.filter((sample) => sample.status === status).length,
      ]),
    ),
    retryAmplification: apiExecutions ? 1 + retries / apiExecutions : 0,
    singleFlightMergeRate: soak ? null : mergeRate,
    cooldownHits: traffic.reduce((sum, value) => sum + value.cooldownHits, 0),
    scenarios,
    memory,
    finalMemory: process.memoryUsage(),
    socketPolicy: 'loopback-only',
    failures,
    samples,
  };
  const directory = resolve('_notes/load-reports');
  await mkdir(directory, { recursive: true });
  const path = resolve(directory, `${report.mode}-${Date.now()}.json`);
  await writeFile(path, JSON.stringify(report, null, 2) + '\n');
  console.log(
    JSON.stringify({ ...report, samples: undefined, reportPath: path }),
  );
  check(failures.length === 0, failures.join('; '));
};

if (import.meta.main) {
  await runLoad(process.argv.includes('--soak'));
}
