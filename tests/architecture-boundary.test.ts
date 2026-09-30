import { expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { Effect } from 'effect';

import { sdkModuleRegistry } from '../src/sdk/generated/registry.generated.ts';
import { findForbiddenArtifactSymbols } from './fixtures/architecture-artifacts.ts';

const root = resolve(import.meta.dir, '..');

const jsDocCases = [
  {
    name: 'type contract',
    source: '/** @type {RawRequest} */\nexport let request',
    symbols: ['RawRequest'],
  },
  {
    name: 'parameter contract',
    source:
      '/** @param {ModuleRequest} request */\nexport function invoke(request) {}',
    symbols: ['ModuleRequest'],
  },
  {
    name: 'return contract',
    source: '/** @returns {RawResponse} */\nexport function request() {}',
    symbols: ['RawResponse'],
  },
  {
    name: 'import type path',
    source:
      '/** @type {import("./raw-request.js").Request} */\nexport let request',
    symbols: ['raw-request'],
  },
  {
    name: 'import type name',
    source:
      '/** @type {import("./transport.js").RawRequest} */\nexport let request',
    symbols: ['RawRequest'],
  },
  {
    name: 'ordinary prose',
    source:
      '/** RawRequest previously used import("./raw-request.js"). */\nexport const request = 1',
    symbols: [],
  },
  {
    name: 'ordinary comments',
    source:
      '/* @type {RawRequest} */\n// @returns {RawResponse}\nexport const request = 1',
    symbols: [],
  },
  {
    name: 'link reference',
    source:
      '/** See {@link RawRequest} and {@link import("./raw-request.js")}. */\nexport const request = 1',
    symbols: [],
  },
  {
    name: 'see reference',
    source:
      '/**\n * @see RawResponse\n * @see import("./raw-request.js")\n */\nexport const request = 1',
    symbols: [],
  },
  {
    name: 'type contract with inert references',
    source:
      '/**\n * @param {ModuleRequest} request - See {@link RawResponse}.\n * @see RawRequest\n */\nexport function invoke(request) {}',
    symbols: ['ModuleRequest'],
  },
];

test.each(
  jsDocCases.flatMap((fixture) =>
    ['JavaScript', 'source map'].map((container) => ({
      ...fixture,
      container,
    })),
  ),
)(
  'artifact JSDoc scanner handles $name in $container',
  async ({ source, symbols, container }) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-artifact-jsdoc-'));
    const file = container === 'JavaScript' ? 'entry.js' : 'entry.js.map';
    try {
      await writeFile(
        resolve(directory, file),
        container === 'JavaScript'
          ? source
          : JSON.stringify({
              sources: ['../src/entry.js'],
              sourcesContent: [source],
            }),
      );
      expect(await findForbiddenArtifactSymbols(directory)).toEqual(
        symbols.map((symbol) => `${file}: ${symbol}`),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);

test.each([
  {
    name: 'JSDoc does not override declaration types',
    source:
      '/** @type {RawRequest} */\nexport declare const request: number;\n/** @param {ModuleRequest} request\n * @returns {RawResponse}\n */\nexport declare function invoke(request: number): number',
    symbols: [],
  },
  {
    name: 'declared contract still owns its type',
    source:
      '/** @type {number}\n * @see RawResponse\n */\nexport declare const request: RawRequest',
    symbols: ['RawRequest'],
  },
])('declaration artifact: $name', async ({ source, symbols }) => {
  const directory = await mkdtemp(
    resolve(tmpdir(), 'hana-artifact-declaration-'),
  );
  try {
    await writeFile(resolve(directory, 'entry.d.ts'), source);
    expect(await findForbiddenArtifactSymbols(directory)).toEqual(
      symbols.map((symbol) => `entry.d.ts: ${symbol}`),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test.each([
  {
    name: 'template interpolation',
    source: 'export const text = `${createLegacyModuleInvoker()}`',
    symbols: ['createLegacyModuleInvoker'],
  },
  {
    name: 'dynamic import with escaped path',
    source: 'export const module = import("./ra\\u0077-request.js")',
    symbols: ['raw-request'],
  },
  {
    name: 'string-named export',
    source: 'export { request as "RawRequest" }',
    symbols: ['RawRequest'],
  },
  {
    name: 'inert example string',
    source: 'export const example = `import("./raw-request.js")`',
    symbols: [],
  },
  {
    name: 'comments',
    source:
      '/* RawRequest */\n// import("./raw-request.js")\nexport const value = 1',
    symbols: [],
  },
  {
    name: 'regular expression text',
    source: 'export const expression = /RawRequest|createLegacyModuleInvoker/g',
    symbols: [],
  },
  {
    name: 'template text',
    source: 'export const text = `RawRequest ${"RawResponse"}`',
    symbols: [],
  },
  {
    name: 'ordinary quoted example',
    source: 'export const example = "import(\'./raw-request.js\')"',
    symbols: [],
  },
  {
    name: 'static import path',
    source: 'import request from "./raw-request.js"',
    symbols: ['raw-request'],
  },
  {
    name: 'static export path',
    source: 'export * from "./_migration.js"',
    symbols: ['_migration'],
  },
  {
    name: 'dynamic import path',
    source: 'export const module = import("./raw-request.js")',
    symbols: ['raw-request'],
  },
  {
    name: 'require path',
    source: 'const request = require("./shared-task.js")',
    symbols: ['shared-task'],
  },
  {
    name: 'string-named import',
    source: 'import { "RawRequest" as request } from "./transport.js"',
    symbols: ['RawRequest'],
  },
  {
    name: 'private identifier',
    source: 'class Request { #RawRequest; }',
    symbols: ['RawRequest'],
  },
  {
    name: 'escaped identifier',
    source: 'export const \\u0052awRequest = 1',
    symbols: ['RawRequest'],
  },
  {
    name: 'nested template expressions',
    source:
      'export const text = `${createLegacyModuleInvoker(import("./raw-request.js"))}`',
    symbols: ['createLegacyModuleInvoker', 'raw-request'],
  },
])('artifact syntax scanner handles $name', async ({ source, symbols }) => {
  const directory = await mkdtemp(resolve(tmpdir(), 'hana-artifact-syntax-'));
  try {
    await writeFile(resolve(directory, 'entry.js'), source);
    expect(await findForbiddenArtifactSymbols(directory)).toEqual(
      symbols.map((symbol) => `entry.js: ${symbol}`),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test.each([
  {
    name: 'identifier names',
    map: { names: ['createLegacyModuleInvoker'] },
    symbols: ['createLegacyModuleInvoker'],
  },
  {
    name: 'retired source path',
    map: { sources: ['../src/core/raw-request.ts'] },
    symbols: ['raw-request'],
  },
  {
    name: 'TSX expression',
    map: {
      sources: ['../src/view.tsx'],
      sourcesContent: [
        'export const node = <div>{createLegacyModuleInvoker()}</div>',
      ],
    },
    symbols: ['createLegacyModuleInvoker'],
  },
  {
    name: 'declaration import type',
    map: {
      sources: ['../src/types.d.ts'],
      sourcesContent: [
        'export type Request = import("./raw-request.js").Value',
      ],
    },
    symbols: ['raw-request'],
  },
  {
    name: 'embedded template expression',
    map: {
      sources: ['../src/message.js'],
      sourcesContent: ['export const text = `${legacySdkModuleRegistry}`'],
    },
    symbols: ['legacySdkModuleRegistry'],
  },
  {
    name: 'inert embedded content',
    map: {
      sources: ['../src/message.js'],
      sourcesContent: [
        '// RawRequest\nexport const text = `import("./raw-request.js")`; export const pattern = /ModuleRequest/',
      ],
    },
    symbols: [],
  },
  {
    name: 'metadata and documentation',
    map: {
      file: 'RawRequest',
      mappings: 'createLegacyModuleInvoker',
      metadata: 'ModuleRequest',
      sources: ['../docs/guide.md'],
      sourcesContent: ['RawResponse'],
    },
    symbols: [],
  },
])('artifact source-map scanner handles $name', async ({ map, symbols }) => {
  const directory = await mkdtemp(resolve(tmpdir(), 'hana-artifact-map-'));
  try {
    await writeFile(resolve(directory, 'entry.js.map'), JSON.stringify(map));
    expect(await findForbiddenArtifactSymbols(directory)).toEqual(
      symbols.map((symbol) => `entry.js.map: ${symbol}`),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('built JavaScript, declarations and source maps contain no retired contracts', async () => {
  const directory = resolve(root, 'dist');
  expect(existsSync(resolve(directory, 'index.js'))).toBe(true);
  expect(existsSync(resolve(directory, 'index.d.ts'))).toBe(true);
  expect(await findForbiddenArtifactSymbols(directory)).toEqual([]);
});

test('the artifact scan catches code and source-map regressions without matching documentation', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'hana-artifact-boundary-'));
  try {
    await writeFile(
      resolve(directory, 'entry.js'),
      'const legacySdkModuleRegistry = {}; export { legacySdkModuleRegistry }',
    );
    await writeFile(
      resolve(directory, 'entry.d.ts'),
      'export type RawRequest = () => Promise<void>',
    );
    await writeFile(
      resolve(directory, 'entry.js.map'),
      JSON.stringify({
        sources: ['../src/core/raw-request.ts', '../docs/guide.md'],
        names: ['createLegacyModuleInvoker'],
        mappings: 'RawResponse',
        sourcesContent: [
          'export type ModuleRequest = unknown',
          'RawRequest guide',
        ],
      }),
    );
    await writeFile(
      resolve(directory, 'clean.mjs'),
      '// RawResponse is discussed here\nexport const message = "LegacyModuleDefinition"',
    );
    await writeFile(
      resolve(directory, 'README.md'),
      'ModuleRequest documentation',
    );
    expect(await findForbiddenArtifactSymbols(directory)).toEqual([
      'entry.d.ts: RawRequest',
      'entry.js.map: ModuleRequest',
      'entry.js.map: createLegacyModuleInvoker',
      'entry.js.map: raw-request',
      'entry.js: legacySdkModuleRegistry',
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('product source and generated artifacts expose one Effect execution path', async () => {
  const forbidden =
    /\b(?:RawRequest|RawResponse|ModuleRequest|legacyModule|LegacyModuleDefinition|legacySdkModuleRegistry|createLegacyModuleInvoker)\b|_migration|_module-inputs|_voice-upload-xml/;
  const failures: Array<string> = [];
  const executionEdges: Array<string> = [];
  const mappingOwners: Array<string> = [];
  const files = [
    'index.ts',
    ...(await readdir(resolve(root, 'src'), { recursive: true })).map(
      (file) => `src/${file}`,
    ),
  ];
  for (const file of files.filter((path) => /\.tsx?$/.test(path))) {
    const source = await readFile(resolve(root, file), 'utf8');
    if (forbidden.test(source)) {
      failures.push(file);
    }
    if (/Effect\.runPromise\s*\(/.test(source)) {
      executionEdges.push(file);
    }
    if (/\bnormalizeFailure\s*\(/.test(source)) {
      mappingOwners.push(file);
    }
    if (file.startsWith('src/modules/') || file === 'src/core/transport.ts') {
      if (/Effect\.runPromise/.test(source)) {
        failures.push(`${file}: execution boundary`);
      }
    }
    if (file.startsWith('src/modules/') && /\bfetch\s*\(/.test(source)) {
      failures.push(`${file}: direct transport`);
    }
    if (file.startsWith('src/core/') && /from ['"]hono/.test(source)) {
      failures.push(`${file}: HTTP dependency`);
    }
  }
  for (const file of [
    'invocation-context',
    'request-runtime',
    'shared-task',
    'raw-request',
    'cache',
    'module-runtime',
  ]) {
    if (existsSync(resolve(root, `src/core/${file}.ts`))) {
      failures.push(`src/core/${file}.ts: retired path`);
    }
  }
  for (const file of ['_migration', '_module-inputs', '_voice-upload-xml']) {
    if (existsSync(resolve(root, `src/modules/${file}.ts`)))
      {failures.push(`src/modules/${file}.ts: retired path`);}
  }
  expect(failures).toEqual([]);
  expect(executionEdges.toSorted()).toEqual([
    'src/core/runtime.ts',
    'src/server/admission.ts',
  ]);
  expect(mappingOwners.toSorted()).toEqual([
    'src/core/response.ts',
    'src/core/runtime.ts',
  ]);
});

test('all module defaults construct Effect work without starting transport', () => {
  const failures = Object.values(sdkModuleRegistry).flatMap((definition) => {
    const work = definition.execute({} as never, () =>
      Effect.die('transport must stay lazy'),
    );
    return Effect.isEffect(work) ? [] : [definition.identifier];
  });
  expect(failures).toEqual([]);
});
