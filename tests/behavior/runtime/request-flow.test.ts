import { expect, spyOn, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { invokeModule as invokeSdk } from '../../../index.ts';
import { startServer } from '../../../src/app/cli.ts';
import {
  createModuleApi,
  invokeModule as invokeProgrammatic,
  loadProgrammaticApi,
} from '../../../src/app/module-api.ts';
import { registerAnonymousToken } from '../../../src/core/anonymous.ts';
import { buildCallServices, runCall } from '../../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import {
  createRequest,
  snapshotRequestData,
} from '../../../src/core/request.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../src/server/create-server.ts';
import type { RequestCapability } from '../../../src/types/index.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import type { WireRequest } from '../../_kit/upstream/scenario.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';

const registration = 'https://music.163.com/weapi/register/anonimous';
const business = 'https://interface.music.163.com/eapi/login/qrcode/unikey';

test.each(['pool', 'implicit'] as const)(
  'flow %s keeps default registration and single-call network ownership',
  async (mode) => {
    const previous = getRuntimeState();
    setRuntimeState({
      anonymousToken: '',
      deviceId: 'runtime-device',
      cnIp: '1.1.1.1',
    });
    const defaults: Array<string> = [];
    const overrides: Array<string> = [];
    try {
      await withScenario(
        mode === 'pool'
          ? [
              {
                url: registration,
                method: 'POST',
                response: () =>
                  Response.json(
                    { code: 200 },
                    { headers: { 'set-cookie': 'MUSIC_A=pool-token; Path=/' } },
                  ),
              },
            ]
          : [],
        async (defaultNetwork) => {
          await withScenario(
            [
              ...(mode === 'implicit'
                ? [
                    {
                      url: registration,
                      method: 'POST',
                      response: () =>
                        Response.json(
                          { code: 200 },
                          {
                            headers: {
                              'set-cookie': 'MUSIC_A=implicit-token; Path=/',
                            },
                          },
                        ),
                    },
                  ]
                : []),
              {
                url: business,
                method: 'POST',
                check: (wire: WireRequest) => {
                  expect(wire.headers.get('cookie')).toContain(
                    `MUSIC_A=${mode}-token`,
                  );
                  expect(wire.headers.get('x-real-ip')).toBe(
                    mode === 'pool' ? '1.1.1.1' : '2.2.2.2',
                  );
                },
                response: () =>
                  Response.json({ code: 200, unikey: 'key-from-B' }),
              },
            ],
            async (singleNetwork) => {
              const config = {
                fetcher: defaultNetwork.fetcher,
                onRequestEvent: (event: { type: string }) =>
                  defaults.push(event.type),
                ...(mode === 'pool' ? { identityPool: { size: 1 } } : {}),
                state: { cnIp: '1.1.1.1' },
              };
              const client = createClientFromContext(
                config,
                buildCallServices(config, true, { entropy: testEntropy }),
              );
              const result = await client.loginQrKey(
                {},
                {
                  fetcher: singleNetwork.fetcher,
                  ip: '2.2.2.2',
                  onRequestEvent: (event) => overrides.push(event.type),
                },
              );
              expect(result.body).toMatchObject({
                data: { unikey: 'key-from-B' },
              });
              expect(defaults).toEqual(mode === 'pool' ? ['attempt'] : []);
              expect(overrides).toEqual(
                mode === 'pool' ? ['attempt'] : ['attempt', 'attempt'],
              );
            },
          );
        },
      );
      expect(getRuntimeState().anonymousToken).toBe(
        mode === 'pool' ? '' : 'implicit-token',
      );
    } finally {
      setRuntimeState(previous);
    }
  },
);

test('flow pool retains successful slots and inherits the first explicit clock', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ anonymousToken: '', deviceId: 'runtime-device' });
  const moments: Array<number> = [];
  const credentials: Array<string> = [];
  try {
    await runEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const instance = yield* TestClock.make();
          const explicit = yield* TestClock.make();
          yield* instance.setTime(100);
          yield* explicit.setTime(300);
          yield* Effect.promise(() =>
            withScenario(
              [
                {
                  url: registration,
                  method: 'POST',
                  response: () =>
                    Response.json(
                      { code: 200 },
                      { headers: { 'set-cookie': 'MUSIC_A=slot-one; Path=/' } },
                    ),
                },
                {
                  url: registration,
                  method: 'POST',
                  response: () => Response.json({ code: 200 }),
                },
                {
                  url: registration,
                  method: 'POST',
                  response: () =>
                    Response.json(
                      { code: 200 },
                      { headers: { 'set-cookie': 'MUSIC_A=slot-two; Path=/' } },
                    ),
                },
                {
                  url: 'https://interface.music.163.com/api/flow',
                  method: 'POST',
                  times: 2,
                  check: (wire: WireRequest) =>
                    credentials.push(wire.headers.get('cookie') ?? ''),
                  response: () => Response.json({ code: 200 }),
                },
              ],
              async (network) => {
                const services = buildCallServices(
                  { fetcher: network.fetcher, identityPool: { size: 2 } },
                  false,
                  {
                    fetcher: network.fetcher,
                    clock: instance,
                    entropy: (now) => {
                      moments.push(now);
                      return testEntropy(now);
                    },
                  },
                );
                const definition = {
                  identifier: 'flow',
                  route: '/flow',
                  actions: {
                    read: {
                      profile: 'api',
                      target: '/api/flow',
                      semantic: 'read',
                      cache: 'none',
                      retry: 'never',
                    },
                  } as const,
                  decodeInput: decodeLegacyModuleInput,
                  execute: (_input: unknown, request: RequestCapability) =>
                    request('read', { data: {}, headers: {} }).pipe(
                      Effect.map((response) => ({
                        body: response.body,
                        status: response.status,
                        cookie: [...response.cookie],
                      })),
                    ),
                };
                const invoke = () =>
                  runCall(
                    { identifier: 'flow', input: {}, config: {} },
                    services,
                    definition,

                    explicit,
                  );
                expect(await settle(invoke())).toMatchObject({
                  rejected: { status: 502 },
                });
                await invoke();
                await invoke();
                expect(
                  network.sent.filter((wire) => wire.url === registration),
                ).toHaveLength(3);
                expect(moments).toEqual([300, 300, 300, 300, 300]);
                expect(credentials[0]).toContain('MUSIC_A=slot-one');
                expect(credentials[1]).toContain('MUSIC_A=slot-two');
              },
            ),
          );
        }),
      ),
    );
    expect(getRuntimeState().anonymousToken).toBe('');
  } finally {
    setRuntimeState(previous);
  }
});

test('flow shared calls preserve a business checkToken field without configured token', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/flow',
        method: 'POST',
        check: (wire: WireRequest) =>
          expect(new URLSearchParams(wire.body).get('checkToken')).toBe(
            'business-data',
          ),
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (network) => {
      await runCall(
        { identifier: 'flow', input: {}, config: { cookie: 'MUSIC_U=test' } },
        buildCallServices({}, false, { fetcher: network.fetcher }),
        {
          identifier: 'flow',
          route: '/flow',
          actions: {
            read: {
              profile: 'api',
              target: '/api/flow',
              semantic: 'read',
              cache: 'shared',
              retry: 'read',
            },
          },
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            request('read', {
              data: { checkToken: 'business-data' },
              headers: {},
            }).pipe(
              Effect.map((response) => ({
                body: response.body,
                status: response.status,
                cookie: [...response.cookie],
              })),
            ),
        },
      );
    },
  );
});

test.each(['pool', 'implicit'] as const)(
  'flow %s preserves proxy ownership at the actual transport boundary',
  async (mode) => {
    const previous = getRuntimeState();
    const proxies: Array<unknown> = [];
    setRuntimeState({
      anonymousToken: '',
      deviceId: 'proxy-device',
      cnIp: '1.1.1.1',
    });
    try {
      await withScenario(
        [
          {
            url: registration,
            method: 'POST',
            response: () =>
              Response.json(
                { code: 200 },
                { headers: { 'set-cookie': 'MUSIC_A=proxy-token; Path=/' } },
              ),
          },
          {
            url: business,
            method: 'POST',
            response: () => Response.json({ code: 200, unikey: 'proxy-key' }),
          },
        ],
        async (network) => {
          const standardFetch = spyOn(globalThis, 'fetch').mockImplementation(
            Object.assign(
              (input: Request | URL | string, init?: RequestInit) => {
                proxies.push(init && Reflect.get(init, 'proxy'));
                return network.fetcher(input, init);
              },
              { preconnect: globalThis.fetch.preconnect },
            ),
          );
          try {
            const config = {
              proxy: 'http://127.0.0.1:3001',
              ...(mode === 'pool' ? { identityPool: { size: 1 } } : {}),
            };
            const client = createClientFromContext(
              config,
              buildCallServices(config, true, { entropy: testEntropy }),
            );
            expect(
              (await client.loginQrKey({}, { proxy: 'http://127.0.0.1:3002' }))
                .body,
            ).toMatchObject({ data: { unikey: 'proxy-key' } });
            expect(proxies).toEqual([
              mode === 'pool' ? config.proxy : 'http://127.0.0.1:3002',
              'http://127.0.0.1:3002',
            ]);
          } finally {
            standardFetch.mockRestore();
          }
        },
      );
    } finally {
      setRuntimeState(previous);
    }
  },
);

test.each(['standalone', 'implicit', 'pool'] as const)(
  'flow %s registration keeps realIP above ip and cnIp',
  async (mode) => {
    const previous = getRuntimeState();
    setRuntimeState({
      anonymousToken: '',
      deviceId: 'ip-device',
      cnIp: '1.1.1.1',
    });
    try {
      await withScenario(
        [
          {
            url: registration,
            method: 'POST',
            check: (wire: WireRequest) =>
              expect(wire.headers.get('x-real-ip')).toBe('5.5.5.5'),
            response: () =>
              Response.json(
                { code: 200 },
                { headers: { 'set-cookie': 'MUSIC_A=ip-token; Path=/' } },
              ),
          },
          ...(mode === 'standalone'
            ? []
            : [
                {
                  url: business,
                  method: 'POST',
                  check: (wire: WireRequest) =>
                    expect(wire.headers.get('x-real-ip')).toBe(
                      mode === 'pool' ? '6.6.6.6' : '5.5.5.5',
                    ),
                  response: () =>
                    Response.json({ code: 200, unikey: 'ip-key' }),
                },
              ]),
        ],
        async (network) => {
          const config = {
            fetcher: network.fetcher,
            realIP: '5.5.5.5',
            ip: '2.2.2.2',
            state: { cnIp: '1.1.1.1' },
            ...(mode === 'pool' ? { identityPool: { size: 1 } } : {}),
          };
          if (mode === 'standalone') {
            expect((await registerAnonymousToken(config)).cnIp).toBe('1.1.1.1');
          } else {
            const client = createClientFromContext(
              config,
              buildCallServices(config, true, { entropy: testEntropy }),
            );
            const result = await client.loginQrKey(
              {},
              { realIP: mode === 'pool' ? '6.6.6.6' : '5.5.5.5' },
            );
            expect(result.status).toBe(200);
          }
        },
      );
    } finally {
      setRuntimeState(previous);
    }
  },
);

test('bound actions carry business data without copying declared policy', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/flow',
        method: 'POST',
        check: (wire) =>
          expect(new URLSearchParams(wire.body).get('value')).toBe('42'),
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (network) => {
      const result = await settle(
        runCall(
          {
            identifier: 'bound',
            input: {},
            config: { cookie: 'MUSIC_U=bound' },
          },
          buildCallServices({}, false, { fetcher: network.fetcher }),
          {
            identifier: 'bound',
            route: '/bound',
            actions: {
              read: {
                profile: 'api',
                target: '/api/flow',
                semantic: 'read',
                cache: 'none',
                retry: 'never',
              },
            },
            decodeInput: decodeLegacyModuleInput,
            execute: (_input, request) =>
              Effect.gen(function* () {
                const response = yield* Reflect.apply(request, undefined, [
                  'read',
                  { data: { value: 42 } },
                ]) as ReturnType<RequestCapability>;
                return {
                  body: response.body,
                  status: response.status,
                  cookie: [...response.cookie],
                };
              }),
          },
        ),
      );
      expect(result).toMatchObject({
        resolved: { status: 200, body: { code: 200 } },
      });
    },
  );
});

// 原生 oracle 直接使用运行时提供但标准库尚未声明的 raw JSON 构造器。
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const nativeJSON = JSON as JSON & {
  rawJSON(text: string): { readonly rawJSON: string };
};

const snapshotCases: Array<{
  name: string;
  make: (events: Array<string>) => unknown;
}> = [
  {
    name: 'keys and omitted values',
    make: () => ({
      z: undefined,
      a: () => 1,
      b: Symbol('b'),
      c: NaN,
      d: Infinity,
      e: -0,
      nested: { value: true },
    }),
  },
  {
    name: 'sparse arrays',
    make: () => {
      const values = [
        undefined,
        undefined,
        () => 1,
        Symbol('x'),
        NaN,
        -0,
        { value: 2 },
      ];
      Reflect.deleteProperty(values, '0');
      return values;
    },
  },
  {
    name: 'raw primitive JSON',
    make: () => ({
      number: nativeJSON.rawJSON('123'),
      negativeZero: nativeJSON.rawJSON('-0'),
      overflow: nativeJSON.rawJSON('1e400'),
      string: nativeJSON.rawJSON('"value"'),
      nested: {
        toJSON() {
          return nativeJSON.rawJSON('true');
        },
      },
    }),
  },
  {
    name: 'dates',
    make: () => ({
      valid: new Date('2024-01-01T00:00:00Z'),
      invalid: new Date(NaN),
    }),
  },
  {
    name: 'boxed primitives',
    make: () => ({
      number: Object(3),
      string: Object('value'),
      boolean: Object(false),
      symbol: Object(Symbol('x')),
    }),
  },
  {
    name: 'boxed conversion order',
    make: (events) => ({
      number: Object.assign(Object(1), {
        valueOf() {
          events.push('number valueOf');
          return 8;
        },
      }),
      string: Object.assign(Object('old'), {
        toString() {
          events.push('string toString');
          return 'new';
        },
      }),
      boolean: Object.assign(Object(false), {
        valueOf() {
          throw new Error('must ignore boolean valueOf');
        },
      }),
    }),
  },
  {
    name: 'boxed primitive hints',
    make: (events) => ({
      number: Object.assign(Object(1), {
        [Symbol.toPrimitive](hint: string) {
          events.push(hint);
          return '12';
        },
      }),
      string: Object.assign(Object('old'), {
        [Symbol.toPrimitive](hint: string) {
          events.push(hint);
          return 13;
        },
      }),
    }),
  },
  {
    name: 'getter traversal order',
    make: (events) => {
      const value: { first: unknown; second?: number } = {
        get first() {
          events.push('first');
          delete value.second;
          Object.assign(value, { added: 3 });
          return {
            get child() {
              events.push('child');
              return 1;
            },
          };
        },
        second: 2,
      };
      return value;
    },
  },
  {
    name: 'shared references and toJSON keys',
    make: (events) => {
      const shared = {
        toJSON(key: string) {
          events.push(`toJSON ${key}`);
          return { value: 1 };
        },
      };
      return { first: shared, second: shared };
    },
  },
  {
    name: 'enumerable toJSON getter',
    make: (events) =>
      Object.defineProperty({ value: 1 }, 'toJSON', {
        enumerable: true,
        get() {
          events.push('get toJSON');
          return function (this: unknown, key: string) {
            events.push(`call ${key}`);
            return this;
          };
        },
      }),
  },
  {
    name: 'inherited keys',
    make: () => Object.assign(Object.create({ inherited: 1 }), { own: 2 }),
  },
  {
    name: 'own proto key',
    make: () =>
      Object.defineProperty({ first: 1 }, '__proto__', {
        value: { marker: true },
        enumerable: true,
      }),
  },
  {
    name: 'array length coercion',
    make: (events) =>
      new Proxy([1, 2, 3], {
        get(target, key, receiver) {
          events.push(String(key));
          return key === 'length' ? 2.8 : Reflect.get(target, key, receiver);
        },
      }),
  },
  {
    name: 'function toJSON',
    make: (events) =>
      Object.assign(() => {}, {
        toJSON(key: string) {
          events.push(key);
          return { value: 1 };
        },
      }),
  },
  { name: 'root undefined', make: () => undefined },
  { name: 'root symbol', make: () => Symbol('root') },
  { name: 'root function', make: () => () => 1 },
  {
    name: 'root no body toJSON',
    make: (events) => ({
      toJSON(key: string) {
        events.push(key);
        return undefined;
      },
    }),
  },
  {
    name: 'cycle',
    make: () => {
      const value: { self?: unknown } = {};
      value.self = value;
      return value;
    },
  },
  {
    name: 'ancestor cycle',
    make: () => {
      const value: { child: { parent?: unknown } } = { child: {} };
      value.child.parent = value;
      return value;
    },
  },
  {
    name: 'cycle removed by toJSON',
    make: () => {
      const value: { self?: unknown; toJSON: () => number } = {
        toJSON() {
          return 1;
        },
      };
      value.self = value;
      return value;
    },
  },
  { name: 'bigint', make: () => ({ value: 1n }) },
  { name: 'boxed bigint', make: () => Object(1n) },
  {
    name: 'bigint toJSON',
    make: () =>
      Object.assign(Object(1n), {
        toJSON() {
          return 'one';
        },
      }),
  },
  {
    name: 'boxed number bigint conversion',
    make: () =>
      Object.assign(Object(1), {
        valueOf() {
          return 1n;
        },
      }),
  },
  {
    name: 'getter failure',
    make: () => ({
      get value() {
        throw new RangeError('getter failure');
      },
    }),
  },
];

test.each(snapshotCases)(
  'API snapshot matches native JSON: $name',
  ({ make }) => {
    const expectedEvents: Array<string> = [];
    const actualEvents: Array<string> = [];
    let expected: unknown;
    let expectedError: unknown;
    let actual: unknown;
    let actualError: unknown;
    try {
      const text = JSON.stringify(make(expectedEvents));
      expected = text === undefined ? undefined : JSON.parse(text);
    } catch (error) {
      expectedError = error;
    }
    try {
      actual = snapshotRequestData(make(actualEvents));
    } catch (error) {
      actualError = error;
    }
    expect(actualEvents).toEqual(expectedEvents);
    if (expectedError instanceof Error) {
      expect(actualError).toBeInstanceOf(expectedError.constructor);
    } else {
      expect(actualError).toBeUndefined();
      expect(actual).toEqual(expected);
      expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
      if (actual && typeof actual === 'object')
        expect(Object.isFrozen(actual)).toBe(true);
    }
  },
);

test.each([
  'protocol',
  'domain',
  'ua',
  'method',
  'response',
  'semantic',
  'cache',
  'retry',
  'cookieOverrides',
  'unknownControl',
])(
  'bound args reject non-enumerable %s before token and transport',
  async (key) => {
    let providers = 0;
    let sends = 0;
    const args = Object.defineProperty({ data: { value: 1 } }, key, {
      value: undefined,
      enumerable: false,
    });
    const result = await settle(
      runCall(
        {
          identifier: 'bound-control',
          input: {},
          config: {
            cookie: 'MUSIC_U=bound',
            checkToken: async () => {
              providers++;
              return 'token';
            },
          },
        },
        buildCallServices({}, false, {
          fetcher: async () => {
            sends++;
            return Response.json({ code: 200 });
          },
        }),
        {
          identifier: 'bound-control',
          route: '/bound',
          actions: {
            read: {
              profile: 'api',
              target: '/api/flow',
              semantic: 'read',
              cache: 'none',
              retry: 'never',
            },
          },
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            Effect.gen(function* () {
              const response = yield* Reflect.apply(request, undefined, [
                'read',
                args,
              ]) as ReturnType<RequestCapability>;
              return {
                body: response.body,
                status: response.status,
                cookie: [...response.cookie],
              };
            }),
        },
      ),
    );
    expect(result).toMatchObject({ rejected: { status: 400 } });
    expect(providers).toBe(0);
    expect(sends).toBe(0);
  },
);

test.each([
  { name: 'undefined', data: undefined },
  { name: 'null', data: null },
  { name: 'number', data: 1 },
  { name: 'string', data: 'value' },
  { name: 'array', data: [] },
  { name: 'bigint', data: 1n },
  { name: 'raw primitive', data: nativeJSON.rawJSON('123') },
])(
  'bound API keeps native serialization and root-error phases for $name',
  async ({ data }) => {
    let providers = 0;
    let entropy = 0;
    let sends = 0;
    const result = await settle(
      runCall(
        {
          identifier: 'root',
          input: {},
          config: {
            cookie: 'MUSIC_U=root',
            checkToken: async () => {
              providers++;
              return 'root-token';
            },
          },
        },
        buildCallServices({}, false, {
          fetcher: async () => {
            sends++;
            return Response.json({ code: 200 });
          },
          entropy: (now) => {
            entropy++;
            return testEntropy(now);
          },
        }),
        {
          identifier: 'root',
          route: '/root',
          actions: {
            read: {
              profile: 'api',
              target: '/api/flow',
              semantic: 'read',
              cache: 'none',
              retry: 'never',
            },
          },
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            Effect.gen(function* () {
              const response = yield* Reflect.apply(request, undefined, [
                'read',
                { data },
              ]) as ReturnType<RequestCapability>;
              return {
                body: response.body,
                status: response.status,
                cookie: [...response.cookie],
              };
            }),
        },
      ),
    );
    expect(result).toMatchObject(
      data === undefined
        ? { resolved: { status: 200 } }
        : { rejected: { status: typeof data === 'bigint' ? 502 : 400 } },
    );
    expect(providers).toBe(typeof data === 'bigint' ? 0 : 1);
    expect(entropy).toBe(data === undefined ? 1 : 0);
    expect(sends).toBe(data === undefined ? 1 : 0);
  },
);

test('bound API snapshots data and request time before token waiting without freezing the input', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        yield* clock.setTime(100);
        const began = createStage('snapshot token');
        let release!: (token: string) => void;
        const token = new Promise<string>((complete) => {
          release = complete;
        });
        let getters = 0;
        const nested = { value: 0 };
        const beforeRequest = createStage('request preparation');
        const data = {
          get nested() {
            getters++;
            return nested;
          },
        };
        const times: Array<number> = [];
        yield* Effect.promise(() =>
          withScenario(
            [
              {
                url: 'https://interface.music.163.com/api/flow',
                method: 'POST',
                check: (wire) => {
                  expect(
                    JSON.parse(new URLSearchParams(wire.body).get('nested')!),
                  ).toEqual({ value: 1 });
                },
                response: () => Response.json({ code: 200 }),
              },
            ],
            async (network) => {
              const pending = runCall(
                {
                  identifier: 'snapshot',
                  input: {},
                  config: {
                    cookie: 'MUSIC_U=snapshot',
                    checkToken: () => {
                      began.reach();
                      return token;
                    },
                  },
                },
                buildCallServices({}, false, {
                  clock,
                  fetcher: network.fetcher,
                  entropy: (now) => {
                    times.push(now);
                    return testEntropy(now);
                  },
                }),
                {
                  identifier: 'snapshot',
                  route: '/snapshot',
                  actions: {
                    read: {
                      profile: 'api',
                      target: '/api/flow',
                      semantic: 'read',
                      cache: 'none',
                      retry: 'never',
                    },
                  },
                  decodeInput: decodeLegacyModuleInput,
                  execute: (_input, request) =>
                    Effect.gen(function* () {
                      beforeRequest.reach();
                      yield* Effect.sleep(20);
                      const response = yield* request('read', { data });
                      return {
                        body: response.body,
                        status: response.status,
                        cookie: [...response.cookie],
                      };
                    }),
                },
              );
              try {
                await beforeRequest.wait(pending);
                nested.value = 1;
                await runEffect(clock.adjust(20));
                await began.wait(pending);
                nested.value = 2;
                expect(Object.isFrozen(data)).toBe(false);
                expect(Object.isFrozen(nested)).toBe(false);
                await runEffect(clock.adjust(50));
                release('snapshot-token');
                expect((await pending).status).toBe(200);
                expect(getters).toBe(1);
                expect(times).toEqual([120]);
              } finally {
                release('snapshot-token');
                await settle(pending);
              }
            },
          ),
        );
      }),
    ),
  );
});

test('assembled actions survive source mutation while new assembly rejects the invalid source', async () => {
  const actions = {
    read: {
      profile: 'api',
      target: '/api/flow',
      semantic: 'read',
      cache: 'none',
      retry: 'never',
    },
  } as const;
  const definition = {
    identifier: 'bound',
    route: '/bound',
    actions,
    decodeInput: decodeLegacyModuleInput,
    execute: (_input: unknown, request: RequestCapability) =>
      request('read', { data: {} }).pipe(
        Effect.map((response) => ({
          status: response.status,
          cookie: [...response.cookie],
          body: response.body,
        })),
      ),
  };
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/flow',
        method: 'POST',
        times: 2,
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (network) => {
      const app = await createServer(
        { moduleDefinitions: [definition] },
        { execution: { fetcher: network.fetcher } },
      );
      expect((await app.request('/bound')).status).toBe(200);
      Reflect.set(actions.read, 'profile', 'invalid');
      expect((await app.request('/bound')).status).toBe(200);
      expect(
        createServer(
          { moduleDefinitions: [definition] },
          { execution: { fetcher: network.fetcher } },
        ),
      ).rejects.toMatchObject({ _tag: 'InvalidRequest' });
      expect(network.sent).toHaveLength(2);
    },
  );
});

test.each(['api', 'plain'] as const)(
  '%s business headers preserve their original case-merge rule',
  async (kind) => {
    const headers = {
      'X-Business': 'first',
      'x-business': 'second',
      'x-nos-token': 'nos-header',
      ...(kind === 'api'
        ? {
            Cookie: 'MUSIC_U=spoof',
            'User-Agent': 'spoof',
            Host: 'outside.example',
            'Content-Type': 'application/spoof',
          }
        : {}),
    };
    await withScenario(
      [
        {
          url:
            kind === 'api'
              ? 'https://interface.music.163.com/api/flow'
              : 'https://music.163.com/playlist?id=1',
          method: kind === 'api' ? 'POST' : 'GET',
          check: (wire) => {
            expect(wire.headers.get('x-business')).toBe(
              kind === 'api' ? 'second' : 'first, second',
            );
            expect(wire.headers.get('x-nos-token')).toBe('nos-header');
            if (kind === 'api') {
              expect(wire.headers.get('cookie')).toContain('MUSIC_U=original');
              expect(wire.headers.get('cookie')).not.toContain('spoof');
              expect(wire.headers.get('user-agent')).not.toBe('spoof');
              expect(wire.headers.get('content-type')).toBe(
                'application/x-www-form-urlencoded',
              );
              expect(new URLSearchParams(wire.body).has('x-nos-token')).toBe(
                false,
              );
            }
          },
          response: () =>
            kind === 'api'
              ? Response.json({ code: 200 })
              : new Response('page'),
        },
      ],
      async (network) => {
        const actions =
          kind === 'api'
            ? {
                read: {
                  profile: 'api',
                  target: '/api/flow',
                  semantic: 'read',
                  cache: 'none',
                  retry: 'never',
                } as const,
              }
            : {
                read: {
                  profile: 'plainMusic',
                  target: '/playlist',
                  method: 'GET',
                  response: 'text',
                  semantic: 'read',
                  cache: 'none',
                  retry: 'never',
                } as const,
              };
        const result = await runCall(
          {
            identifier: 'headers',
            input: {},
            config: { cookie: 'MUSIC_U=original' },
          },
          buildCallServices({}, false, { fetcher: network.fetcher }),
          {
            identifier: 'headers',
            route: '/headers',
            actions,
            decodeInput: decodeLegacyModuleInput,
            execute: (_input, request) =>
              request(
                'read',
                kind === 'api'
                  ? { data: {}, headers }
                  : { query: 'id=1', headers },
              ).pipe(
                Effect.map((response) => ({
                  body: response.body,
                  status: response.status,
                  cookie: [...response.cookie],
                })),
              ),
          },
        );
        expect(result.status).toBe(200);
      },
    );
  },
);

test.each(['cycle', 'bigint', 'toJSON'] as const)(
  'serialization %s keeps raw rejection and module failure before token',
  async (kind) => {
    const data: Record<string, unknown> =
      kind === 'bigint'
        ? { value: 1n }
        : kind === 'toJSON'
          ? {
              toJSON() {
                throw new RangeError('toJSON failed');
              },
            }
          : {};
    if (kind === 'cycle') data.self = data;
    let providers = 0;
    let sends = 0;
    const fetcher = async () => {
      sends++;
      return Response.json({ code: 200 });
    };
    const raw = await settle(
      createRequest('/api/flow', data, { crypto: 'api', fetcher }),
    );
    expect(raw).toHaveProperty('rejected');
    if ('rejected' in raw)
      expect(raw.rejected).toBeInstanceOf(
        kind === 'toJSON' ? RangeError : TypeError,
      );
    const module = await settle(
      runCall(
        {
          identifier: 'serialization',
          input: {},
          config: {
            cookie: 'MUSIC_U=serialization',
            checkToken: async () => {
              providers++;
              return 'unused-token';
            },
          },
        },
        buildCallServices({}, false, { fetcher }),
        {
          identifier: 'serialization',
          route: '/serialization',
          actions: {
            read: {
              profile: 'api',
              target: '/api/flow',
              semantic: 'read',
              cache: 'none',
              retry: 'never',
            },
          },
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            request('read', { data }).pipe(
              Effect.map((response) => ({
                body: response.body,
                status: response.status,
                cookie: [...response.cookie],
              })),
            ),
        },
      ),
    );
    expect(module).toMatchObject({ rejected: { status: 502 } });
    expect(providers).toBe(0);
    expect(sends).toBe(0);
  },
);

test('bound capability types constrain local actions and API/plain parameters', async () => {
  await mkdir(resolve(projectRoot, '.artifacts/testing'), { recursive: true });
  const directory = await mkdtemp(
    resolve(projectRoot, '.artifacts/testing/bound-action-types-'),
  );
  const prefix = [
    `import type {RequestCapability} from ${JSON.stringify(resolve(projectRoot, 'src/types/runtime.ts'))};`,
    `const actions = {read: {profile: 'api', target: '/api/flow', semantic: 'read', cache: 'none', retry: 'never'}, dynamic: {profile: 'web', target: {prefix: '/api/range/'}, semantic: 'read', cache: 'none', retry: 'never'}, page: {profile: 'plainMusic', target: '/playlist', method: 'GET', response: 'text', semantic: 'read', cache: 'none', retry: 'never'}, upload: {profile: 'plainNos', target: {prefix: '/jd-musicrep-privatecloud-audio-public/'}, method: 'POST', response: 'bytes', semantic: 'upload', cache: 'none', retry: 'never'}} as const;`,
    'declare const request: RequestCapability<typeof actions>;',
    'declare const empty: RequestCapability<{}>;',
    'const bytes = new Uint8Array([1, 2]); void empty;',
  ];
  const positive = [
    "request('read', {data: {id: 1}, headers: {'x-nos-token': 'value'}});",
    "request('dynamic', {path: '/api/range/1', data: {}});",
    "request('page', {query: 'id=a%2Bb'});",
    "request('upload', {target: 'https://nosup-hz1.127.net/jd-musicrep-privatecloud-audio-public/key', body: bytes});",
  ];
  const negative = [
    "request('missing', {data: {}});",
    ...[
      'protocol',
      'domain',
      'ua',
      'method',
      'response',
      'semantic',
      'cache',
      'retry',
    ].map((key) => `request('read', {data: {}, ${key}: 'forbidden'});`),
    "request('read', {data: {}, path: '/api/flow'});",
    "request('read', {body: bytes});",
    "request('dynamic', {data: {}});",
    "request('page', {data: {}});",
    "request('page', {target: 'https://music.163.com/playlist'});",
    "request('upload', {query: 'id=1'});",
    "request('upload', {target: 'https://nosup-hz1.127.net/key', data: {}});",
    "empty('read', {data: {}});",
    "const controlled = {data: {}, method: 'GET'}; request('read', controlled);",
  ];
  try {
    await writeFile(
      resolve(directory, 'tsconfig.json'),
      JSON.stringify({
        extends: resolve(projectRoot, 'tsconfig.json'),
        include: ['control.ts'],
        exclude: [],
      }),
    );
    for (const invalid of [false, true]) {
      await writeFile(
        resolve(directory, 'control.ts'),
        [...prefix, ...(invalid ? negative : positive)].join('\n'),
      );
      const child = Bun.spawn(
        [
          process.execPath,
          resolve(projectRoot, 'node_modules/typescript/bin/tsc'),
          '--project',
          resolve(directory, 'tsconfig.json'),
          '--pretty',
          'false',
        ],
        { stdout: 'pipe', stderr: 'pipe' },
      );
      const [exitCode, stdout, stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      const output = stdout + stderr;
      expect(exitCode, output).toBe(invalid ? 1 : 0);
      if (invalid)
        for (let index = 0; index < negative.length; index++)
          expect(output).toContain(`control.ts(${prefix.length + index + 1},`);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);

test('API header getter errors keep the provider and entropy phase', async () => {
  let providers = 0;
  let entropy = 0;
  let sends = 0;
  const headers = {
    get 'X-Business'(): string {
      throw new RangeError('header failure');
    },
  };
  const fetcher = async () => {
    sends++;
    return Response.json({ code: 200 });
  };
  const result = await settle(
    runCall(
      {
        identifier: 'header-error',
        input: {},
        config: {
          cookie: 'MUSIC_U=headers',
          checkToken: async () => {
            providers++;
            return 'header-token';
          },
        },
      },
      buildCallServices({}, false, {
        fetcher,
        entropy: (now) => {
          entropy++;
          return testEntropy(now);
        },
      }),
      {
        identifier: 'header-error',
        route: '/header-error',
        actions: {
          read: {
            profile: 'api',
            target: '/api/flow',
            semantic: 'read',
            cache: 'none',
            retry: 'never',
          },
        },
        decodeInput: decodeLegacyModuleInput,
        execute: (_input, request) =>
          request('read', { data: {}, headers }).pipe(
            Effect.map((response) => ({
              status: response.status,
              cookie: [...response.cookie],
              body: response.body,
            })),
          ),
      },
    ),
  );
  expect(result).toMatchObject({
    rejected: { status: 400, body: { msg: 'header failure' } },
  });
  expect(providers).toBe(1);
  expect(entropy).toBe(0);
  expect(
    await settle(
      createRequest(
        '/api/flow',
        {},
        { crypto: 'api', cookie: {}, headers, fetcher },
      ),
    ),
  ).toMatchObject({
    rejected: { status: 400, body: { msg: 'header failure' } },
  });
  expect(sends).toBe(0);
});

test.each([
  { source: 'own enumerable', enumerable: true, inherited: false },
  { source: 'own hidden', enumerable: false, inherited: false },
  { source: 'inherited enumerable', enumerable: true, inherited: true },
  { source: 'inherited hidden', enumerable: false, inherited: true },
])(
  'assembly refuses removed requestHandler before copying options: $source',
  async ({ enumerable, inherited }) => {
    let executions = 0;
    const definition = {
      identifier: 'local_removed_handler',
      route: '/local',
      actions: {},
      decodeInput: decodeLegacyModuleInput,
      execute: () =>
        Effect.sync(() => {
          executions++;
          return { status: 200, cookie: [], body: { code: 200 } };
        }),
    };
    let handlerReads = 0;
    const removed = Object.defineProperty({}, 'requestHandler', {
      enumerable,
      get: () => {
        handlerReads++;
        return undefined;
      },
    });
    const options = {
      moduleDefinitions: [definition],
      hostname: '127.0.0.1',
      port: 0,
      silent: true,
    };
    if (inherited) Object.setPrototypeOf(options, removed);
    else
      Object.defineProperties(
        options,
        Object.getOwnPropertyDescriptors(removed),
      );
    const results = [
      await createServer(options).then(
        () => 'accepted',
        (error: unknown) => error,
      ),
      await loadProgrammaticApi(options).then(
        () => 'accepted',
        (error: unknown) => error,
      ),
      await Reflect.apply(invokeProgrammatic, undefined, [
        'local_removed_handler',
        {},
        options,
      ]).then(
        () => 'accepted',
        (error: unknown) => error,
      ),
      await startServer(options).then(
        async (started) => {
          await started.server.stop(true);
          return 'accepted';
        },
        (error: unknown) => error,
      ),
    ];
    try {
      createModuleApi(options);
      results.push('accepted');
    } catch (error) {
      results.push(error);
    }
    for (const result of results) expect(result).toBeInstanceOf(TypeError);
    expect(executions).toBe(0);
    expect(handlerReads).toBe(0);
  },
);

test('shared keys ignore observers and waiter timeout while preserving effective config distinctions', async () => {
  const began = createStage('shared key request');
  let release!: () => void;
  const gate = new Promise<void>((complete) => {
    release = complete;
  });
  let requests = 0;
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        times: 3,
        response: async () => {
          if (requests++ === 0) {
            began.reach();
            await gate;
          }
          return Response.json({ code: 200, result: { songs: [] } });
        },
      },
    ],
    async (network) => {
      const firstEvents: Array<string> = [];
      const laterEvents: Array<string> = [];
      const config = {
        cookie: 'MUSIC_U=shared-key',
        state: { deviceId: 'key-device', cnIp: '1.1.1.1' },
        cache: { ttlMs: 1000 },
      };
      // 固定请求熵后，两份仅配置来源不同的请求可以逐字比较 wire。
      const context = buildCallServices(config, false, {
        fetcher: network.fetcher,
        entropy: () => testEntropy(100),
      });
      const client = createClientFromContext(config, context);
      const first = client.search(
        { keywords: 'same' },
        {
          timeoutMs: 1000,
          onRequestEvent: (event) => firstEvents.push(event.type),
        },
      );
      const second = client.search(
        { keywords: 'same' },
        {
          timeoutMs: 2000,
          onRequestEvent: (event) => laterEvents.push(event.type),
        },
      );
      try {
        await began.wait(Promise.all([first, second]));
        expect(network.entries).toHaveLength(1);
        release();
        await Promise.all([first, second]);
        await client.search(
          { keywords: 'same' },
          {
            timeoutMs: 500,
            onRequestEvent: (event) => laterEvents.push(event.type),
          },
        );
        expect(network.entries).toHaveLength(1);
        expect(firstEvents).toEqual(['attempt']);
        expect(laterEvents).toEqual([]);
        await client.search({ keywords: 'same' }, { ip: '8.8.8.8' });
        await client.search({ keywords: 'same' }, { realIP: '8.8.8.8' });
        expect(network.sent).toHaveLength(3);
        const matchingWire = network.sent.slice(1).map((wire) => ({
          url: wire.url,
          method: wire.method,
          headers: Object.fromEntries(wire.headers),
          body: wire.body,
        }));
        expect(matchingWire[0]).toEqual(matchingWire[1]);
        expect(context.reads.snapshot).toMatchObject({
          inflight: 0,
          merged: 1,
          cacheHits: 1,
        });
      } finally {
        release();
        await Promise.allSettled([first, second]);
      }
    },
    () => release(),
  );
});

for (const entry of ['root', 'dynamic'] as const) {
  for (const kind of ['non-enumerable', 'inherited'] as const) {
    test.each(['before', 'during'] as const)(
      `raw config ${entry} keeps ${kind} signal when cancelled %s the request`,
      async (mode) => {
        const controller = new AbortController();
        const began = createStage('signal transport');
        let release!: () => void;
        const gate = new Promise<void>((complete) => {
          release = complete;
        });
        if (mode === 'before') controller.abort();
        await withScenario(
          mode === 'before'
            ? []
            : [
                {
                  url: business,
                  method: 'POST',
                  response: async (wire) => {
                    began.reach();
                    await gate;
                    if (wire.signal.aborted)
                      throw new DOMException('Cancelled', 'AbortError');
                    return Response.json({ code: 200, unikey: 'late' });
                  },
                },
              ],
          async (network) => {
            const config = {
              cookie: 'MUSIC_U=raw-signal',
              fetcher: network.fetcher,
              timeoutMs: 500,
            };
            if (kind === 'non-enumerable')
              Object.defineProperty(config, 'signal', {
                value: controller.signal,
                enumerable: false,
              });
            else Object.setPrototypeOf(config, { signal: controller.signal });
            const pending = settle(
              entry === 'root'
                ? invokeSdk('login_qr_key', {}, config)
                : invokeProgrammatic('login_qr_key', {}, {}, config),
            );
            try {
              if (mode === 'during') {
                await began.wait(pending);
                controller.abort();
              }
              expect(await pending).toMatchObject({
                rejected: { status: 499 },
              });
              expect(network.entries).toHaveLength(mode === 'before' ? 0 : 1);
            } finally {
              release();
              await pending;
            }
          },
          () => release(),
        );
      },
    );
  }
}
