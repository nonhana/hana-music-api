import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { Effect } from 'effect';

import {
  createHanaMusicApi,
  createOption,
  createRequest,
  innerVersion,
  invokeModule,
} from '../../../index.ts';
import { buildGeneratedArtifacts } from '../../../scripts/gen-module-types.mts';
import {
  createModuleApi,
  invokeModule as invokeProgrammatic,
  loadProgrammaticApi,
} from '../../../src/app/module-api.ts';
import { buildCallServices, runCall } from '../../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import { loadModuleDefinitions } from '../../../src/server/module-loader.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';

const removed = {
  crypto: 'api',
  ua: 'mixed-client',
  domain: 'https://outside.example',
  e_r: true,
  acceptGzip: true,
  headers: { 'uSeR-aGeNt': 'mixed-client' },
  deviceId: 'old-device',
};

for (const [key, value] of Object.entries(removed)) {
  for (const supplied of [value, undefined]) {
    test(`module config rejects ${key}=${typeof supplied === 'object' ? JSON.stringify(supplied) : String(supplied)} before local execution`, async () => {
      let sends = 0;
      let tokens = 0;
      const config = {
        [key]: supplied,
        checkToken: async () => {
          tokens += 1;
          return 'unused';
        },
        fetcher: async () => {
          sends += 1;
          return Response.json({ code: 200 });
        },
      };
      for (const invoke of [
        () => Reflect.apply(innerVersion, undefined, [{}, config]),
        () =>
          Reflect.apply(invokeModule, undefined, ['inner_version', {}, config]),
        () =>
          Reflect.apply(createHanaMusicApi().innerVersion, undefined, [
            {},
            config,
          ]),
      ]) {
        expect(await settle(invoke())).toMatchObject({
          rejected: { status: 400 },
        });
      }
      expect(sends).toBe(0);
      expect(tokens).toBe(0);
    });
  }
  test(`module client rejects removed default ${key}`, () => {
    expect(() =>
      Reflect.apply(createHanaMusicApi, undefined, [{ [key]: value }]),
    ).toThrow(TypeError);
  });
}

test('module config rejects unknown keys and low-level createOption as a module alias', async () => {
  expect(
    await settle(
      Reflect.apply(innerVersion, undefined, [{}, { unknownControl: true }]),
    ),
  ).toMatchObject({ rejected: { status: 400 } });
  expect(
    await settle(innerVersion({}, createOption({ crypto: 'weapi' }))),
  ).toMatchObject({ rejected: { status: 400 } });
});

test.each([
  'crypto',
  'ua',
  'domain',
  'deviceId',
  'checkToken',
  'fetcher',
  'cache',
  'identityPool',
])('module query rejects execution key %s', async (key) => {
  expect(
    await settle(Reflect.apply(innerVersion, undefined, [{ [key]: 'bad' }])),
  ).toMatchObject({ rejected: { status: 400 } });
});

test('module assembly refuses missing actions before executing a local body', async () => {
  let executions = 0;
  const definition = {
    identifier: 'custom',
    route: '/custom',
    decodeInput: decodeLegacyModuleInput,
    execute: () =>
      Effect.sync(() => {
        executions += 1;
        return { status: 200, cookie: [], body: {} };
      }),
  };
  expect(
    await settle(
      runCall(
        { identifier: 'custom', input: {}, config: {} },
        buildCallServices({}, false),
        definition as never,
      ),
    ),
  ).toMatchObject({ rejected: { status: 400 } });
  expect(executions).toBe(0);
});

for (const declaration of [
  '',
  'export const moduleActions = { read: { profile: "invalid", target: "/api/read", semantic: "read", cache: "none", retry: "never" } };',
]) {
  test(`module generator and loader reject ${declaration ? 'invalid' : 'missing'} actions`, async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'hana-required-actions-'),
    );
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `export type ModuleInput = {}; export const decodeModuleInput = (input) => input; ${declaration} const sample: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (input) => input; export default sample;`,
      );
      expect(
        await buildGeneratedArtifacts(directory).then(
          () => 'accepted',
          () => 'rejected',
        ),
      ).toBe('rejected');
      expect(
        await loadModuleDefinitions(directory).then(
          () => 'accepted',
          () => 'rejected',
        ),
      ).toBe('rejected');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

test('module dynamic API accepts config separately and refuses removed query controls', async () => {
  const api = createModuleApi();
  expect(
    await settle(
      Reflect.apply(api.inner_version, undefined, [{ crypto: 'api' }]),
    ),
  ).toMatchObject({
    rejected: { status: 400 },
  });
  expect(
    await Reflect.apply(api.inner_version, undefined, [
      {},
      { state: { deviceId: 'device' } },
    ]),
  ).toMatchObject({ status: 200 });
  expect(
    await settle(
      Reflect.apply(api.inner_version, undefined, [{}, { crypto: 'api' }]),
    ),
  ).toMatchObject({ rejected: { status: 400 } });
});

test('low-level raw requests never infer read retries from a search URI', async () => {
  let sends = 0;
  const result = await settle(
    createRequest(
      '/api/search/get',
      {},
      {
        cookie: 'MUSIC_U=raw',
        retry: { backoffMs: 0 },
        fetcher: async () => {
          sends += 1;
          throw new Error('ECONNREFUSED');
        },
      },
    ),
  );
  expect(result).toMatchObject({ rejected: { status: 502 } });
  expect(sends).toBe(1);
});

test('low-level createRequest refuses module checkToken without sending', async () => {
  let sends = 0;
  expect(
    await settle(
      Reflect.apply(createRequest, undefined, [
        '/api/search/get',
        {},
        {
          checkToken: 'module-token',
          fetcher: async () => {
            sends += 1;
            return Response.json({ code: 200 });
          },
        },
      ]),
    ),
  ).toMatchObject({ rejected: { status: 400 } });
  expect(sends).toBe(0);
});

test('module empty actions cannot send an undeclared API request', async () => {
  let sends = 0;
  expect(
    await settle(
      runCall(
        {
          identifier: 'local',
          input: {},
          config: {
            cookie: 'MUSIC_U=local',
            fetcher: async () => {
              sends++;
              return Response.json({ code: 200 });
            },
          },
        },
        buildCallServices({}, false),
        {
          identifier: 'local',
          route: '/local',
          actions: {},
          decodeInput: decodeLegacyModuleInput,
          execute: (_input, request) =>
            request('undeclared', { data: {}, headers: {} }).pipe(
              Effect.map((response) => ({
                status: response.status,
                cookie: [...response.cookie],
                body: response.body,
              })),
            ),
        },
      ),
    ),
  ).toMatchObject({ rejected: { status: 400 } });
  expect(sends).toBe(0);
});

for (const key of [...Object.keys(removed), 'unknownControl']) {
  test(`module non-enumerable ${key} is rejected by every call entry`, async () => {
    const api = createModuleApi();
    const eager = await loadProgrammaticApi();
    let copies = 0;
    let sends = 0;
    let providers = 0;
    const config = Object.defineProperty(
      {
        get cookie() {
          copies++;
          return 'MUSIC_U=not-copied';
        },
        fetcher: async () => {
          sends++;
          return Response.json({ code: 200 });
        },
        checkToken: async () => {
          providers++;
          return 'unused';
        },
      },
      key,
      { value: undefined, enumerable: false },
    );
    for (const call of [
      () => Reflect.apply(innerVersion, undefined, [{}, config]),
      () =>
        Reflect.apply(createHanaMusicApi().innerVersion, undefined, [
          {},
          config,
        ]),
      () =>
        Reflect.apply(invokeModule, undefined, ['inner_version', {}, config]),
      () => Reflect.apply(api.inner_version, undefined, [{}, config]),
      () => Reflect.apply(eager.inner_version, undefined, [{}, config]),
      () =>
        Reflect.apply(invokeProgrammatic, undefined, [
          'inner_version',
          {},
          {},
          config,
        ]),
    ])
      expect(await settle(call())).toMatchObject({ rejected: { status: 400 } });
    expect(sends).toBe(0);
    expect(providers).toBe(0);
    expect(copies).toBe(0);
  });
}

for (const [label, fields] of [
  ['method DELETE', { method: 'DELETE' }],
  ['method number', { method: 123 }],
  ['response bogus', { response: 'bogus' }],
  ['response bytes', { response: 'bytes' }],
  ['semantic array', { semantic: ['read'] }],
  ['cache array', { cache: ['none'] }],
  ['retry array', { retry: ['never'] }],
] as const) {
  test(`module assembly rejects API ${label} before execution`, async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'hana-invalid-action-mode-'),
    );
    const action = {
      profile: 'eapi',
      target: '/api/probe',
      semantic: 'read',
      cache: 'none',
      retry: 'never',
      ...fields,
    };
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `export type ModuleInput = {}; export const decodeModuleInput = (input) => input; export const moduleActions = { read: ${JSON.stringify(action)} }; const sample: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (input) => input; export default sample;`,
      );
      const generated = await buildGeneratedArtifacts(directory).then(
        () => 'accepted',
        () => 'rejected',
      );
      const loaded = await loadModuleDefinitions(directory).then(
        () => 'accepted',
        () => 'rejected',
      );
      let executions = 0;
      const result = await settle(
        runCall(
          { identifier: 'invalid', input: {}, config: {} },
          buildCallServices({}, false),
          {
            identifier: 'invalid',
            route: '/invalid',
            actions: { read: action } as never,
            decodeInput: decodeLegacyModuleInput,
            execute: () =>
              Effect.sync(() => {
                executions++;
                return { status: 200, cookie: [], body: {} };
              }),
          },
        ),
      );
      expect({ generated, loaded, result }).toMatchObject({
        generated: 'rejected',
        loaded: 'rejected',
        result: { rejected: { status: 400 } },
      });
      expect(executions).toBe(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

for (const inherited of [false, true]) {
  for (const [field, value] of [
    ['method', 'GET'],
    ['method', 123],
    ['response', 'bytes'],
    ['response', 'bogus'],
  ] as const) {
    test(`action snapshot rejects hidden ${field}=${value}, inherited=${inherited}`, async () => {
      const action = {
        profile: 'eapi',
        target: '/api/probe',
        semantic: 'read',
        cache: 'none',
        retry: 'never',
      };
      if (inherited) Object.setPrototypeOf(action, { [field]: value });
      else Object.defineProperty(action, field, { value });
      let executions = 0;
      const result = await settle(
        runCall(
          { identifier: 'hidden_action', input: {}, config: {} },
          buildCallServices({}, false),
          {
            identifier: 'hidden_action',
            route: '/hidden-action',
            // 模拟 JavaScript 动态模块的非法声明，交由真实装配边界拒绝。
            actions: { read: action } as never,
            decodeInput: decodeLegacyModuleInput,
            execute: () =>
              Effect.sync(() => {
                executions++;
                return { status: 200, cookie: [], body: {} };
              }),
          },
        ),
      );
      expect(result).toMatchObject({ rejected: { status: 400 } });
      expect(executions).toBe(0);
    });
  }
}

for (const hidden of [false, true]) {
  test(`action snapshot captures legal optional getters once, hidden=${hidden}`, async () => {
    const reads = { method: 0, response: 0, target: 0 };
    const action = {
      profile: 'eapi',
      semantic: 'read',
      cache: 'none',
      retry: 'never',
      get target() {
        reads.target++;
        return '/api/probe';
      },
    } as const;
    for (const field of ['method', 'response'] as const) {
      Object.defineProperty(action, field, {
        enumerable: !hidden,
        get: () => {
          reads[field]++;
          return field === 'method' ? 'POST' : 'json';
        },
      });
    }
    const result = await runCall(
      { identifier: 'legal_action', input: {}, config: {} },
      buildCallServices({}, false),
      {
        identifier: 'legal_action',
        route: '/legal-action',
        actions: { read: action },
        decodeInput: decodeLegacyModuleInput,
        execute: () => Effect.succeed({ status: 200, cookie: [], body: {} }),
      },
    );
    expect(result.status).toBe(200);
    expect(reads).toEqual({ method: 1, response: 1, target: 1 });
  });
}

test('module illegal retry array cannot grant connection replay', async () => {
  let sends = 0;
  const result = await settle(
    runCall(
      {
        identifier: 'invalid_retry',
        input: {},
        config: {
          cookie: 'MUSIC_U=reader',
          retry: { backoffMs: 0 },
          fetcher: async () => {
            sends++;
            throw new Error('ECONNREFUSED');
          },
        },
      },
      buildCallServices({}, false),
      {
        identifier: 'invalid_retry',
        route: '/invalid-retry',
        decodeInput: decodeLegacyModuleInput,
        actions: {
          read: {
            profile: 'eapi',
            target: '/api/probe',
            semantic: 'read',
            cache: 'none',
            retry: ['never'],
          },
        } as never,
        execute: (_input, request) =>
          request('read', { data: {}, headers: {} }).pipe(
            Effect.map((response) => ({
              status: response.status,
              cookie: [...response.cookie],
              body: response.body,
            })),
          ),
      },
    ),
  );
  expect(result).toMatchObject({ rejected: { status: 400 } });
  expect(sends).toBe(0);
});

test('module direct dynamic invocation types reject execution keys in both queries', async () => {
  const options = ["crypto: 'api'", 'cache: {}', 'identityPool: { size: 1 }'];
  await mkdir(resolve(projectRoot, '.artifacts/testing'), { recursive: true });
  const directory = await mkdtemp(
    resolve(projectRoot, '.artifacts/testing/module-config-types-'),
  );
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
      const calls = options.flatMap((option, index) => [
        `const staticCall${index} = () => invokeModule('lyric', { id: '1'${invalid ? `, ${option}` : ''} }, {}, { state: { deviceId: 'device' } });`,
        `const identifier${index}: string = 'custom';`,
        `const dynamicCall${index} = () => invokeModule(identifier${index}, { id: '1'${invalid ? `, ${option}` : ''} }, { modulesDirectory: '/unused' }, { state: { deviceId: 'device' } });`,
        `void staticCall${index}; void dynamicCall${index};`,
      ]);
      await writeFile(
        resolve(directory, 'control.ts'),
        [
          `import { invokeModule } from ${JSON.stringify(resolve(projectRoot, 'src/app/module-api.ts'))};`,
          ...calls,
          `const clientConfig: import(${JSON.stringify(resolve(projectRoot, 'index.ts'))}).CreateHanaMusicApiConfig = { cache: { enabled: true }, identityPool: { size: 2 } };`,
          'void clientConfig;',
        ].join('\n'),
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
      if (!invalid) expect(exitCode, output).toBe(0);
      else {
        expect(exitCode, output).not.toBe(0);
        for (const line of [2, 4, 6, 8, 10, 12])
          expect(output).toContain(`control.ts(${line},`);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);

test.each([
  'ModuleEffect<ModuleInput>',
  'ModuleEffect<ModuleInput, UnknownJson, ModuleActions>',
])(
  'module generator rejects an unbound action capability: %s',
  async (annotation) => {
    const directory = await mkdtemp(
      resolve(projectRoot, '.artifacts/testing/bound-generator-'),
    );
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `export type ModuleInput = {}; export const decodeModuleInput = (input) => input; export const moduleActions = {read: {profile: 'api', target: '/api/read', semantic: 'read', cache: 'none', retry: 'never'}}; const sample: ${annotation} = (input) => input; export default sample;`,
      );
      const outcome = await buildGeneratedArtifacts(directory).then(
        () => 'accepted',
        () => 'rejected',
      );
      expect(outcome).toBe('rejected');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
