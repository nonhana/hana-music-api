import { beforeAll, describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

import { chromium } from 'playwright';

import { findForbiddenArtifactSymbols } from '../_kit/artifacts.ts';
import { projectRoot } from '../_kit/assertions.ts';
import { currentRequests } from '../_kit/current-requests.ts';
import { fingerprint, writeEvidence } from '../_kit/evidence.ts';
import albumNoDescription from '../fixtures/netease/library/album.no-description.json';
import artistAlbum from '../fixtures/netease/library/artist_album.json';
import artistTopSong from '../fixtures/netease/library/artist_top_song.json';
import songDetailPrivileges from '../fixtures/netease/library/song_detail.privileges.json';

const PACKAGE_JSON_PATH = resolve(projectRoot, 'package.json');
const WORKFLOWS_DIRECTORY = resolve(projectRoot, '.github/workflows');
const CHANGESET_CONFIG_PATH = resolve(projectRoot, '.changeset/config.json');
const TSC_CLI_PATH = resolve(projectRoot, 'node_modules/typescript/bin/tsc');
const FS_ACCESS_RECORDER_PATH = resolve(
  projectRoot,
  'tests/fixtures/consumers/fs-access-recorder.mjs',
);
const SERVERLESS_CONSUMER_PATH = resolve(
  projectRoot,
  'tests/fixtures/consumers/serverless.mjs',
);
const OFFLINE_PROCESS_PATH = resolve(
  projectRoot,
  'tests/fixtures/consumers/offline-process.mjs',
);
const REQUIRED_ROOT_EXPORTS = [
  'createClient',
  'createHanaMusicApi',
  'invokeModule',
  'createRequest',
  'createOption',
  'generateDeviceId',
  'isNcmApiResponse',
  'getNcmFailureInfo',
];
const REPRESENTATIVE_CAMEL_CASE_EXPORTS = ['search', 'songUrl'];
const FORBIDDEN_ROOT_EXPORTS = [
  'createClientFromContext',
  'startServer',
  'serveNcmApi',
  'createServer',
  'ensureAnonymousToken',
  'generateConfig',
  'registerAnonymous',
  'createModuleApi',
  'loadProgrammaticApi',
  'NeteaseCloudMusicApi',
  'SongDetailBody',
  'AlbumBody',
  'ArtistAlbumBody',
  'ArtistTopSongBody',
  'LoginCellphoneRiskBody',
];
const EXPECTED_EXPORT_PATHS = [
  '.',
  './api/*',
  './core',
  './schemas',
  './schemas/*',
  './utils',
  './watchman',
];
const EXPECTED_EXPORT_MAP = {
  '.': {
    types: './dist/index.d.ts',
    default: './dist/index.js',
  },
  './api/*': {
    types: './dist/api/*.d.ts',
    default: './dist/api/*.js',
  },
  './schemas': {
    types: './dist/schemas.d.ts',
    default: './dist/schemas.js',
  },
  './schemas/*': {
    types: './dist/schemas/*.d.ts',
    default: './dist/schemas/*.js',
  },
  './core': {
    types: './dist/core.d.ts',
    default: './dist/core.js',
  },
  './utils': {
    types: './dist/utils.d.ts',
    default: './dist/utils.js',
  },
  './watchman': {
    types: './dist/watchman.d.ts',
    default: './dist/watchman.js',
  },
} as const;
const MAX_SINGLE_DTS_BYTES = 512 * 1024;
const MAX_SINGLE_JS_BYTES = 256 * 1024;

describe('sdk release contract', () => {
  beforeAll(ensureBuiltArtifacts, 60_000);
  test('should expose the approved subpath exports and minimal dependency boundary', () => {
    const exportMap = sdkPackage.exports ?? {};

    expect(sdkPackage.name).toBe('hana-music-api');
    expect(sdkPackage.private).toBe(false);
    expect(sdkPackage.type).toBe('module');
    expect(sdkPackage.sideEffects).toBe(false);
    expect(sdkPackage.engines).toEqual({ node: '>=24' });
    expect(Object.keys(exportMap).toSorted()).toEqual(EXPECTED_EXPORT_PATHS);
    for (const [subpath, target] of Object.entries(EXPECTED_EXPORT_MAP)) {
      expect(exportMap[subpath]).toEqual(target);
    }
    expect(Object.keys(sdkPackage.dependencies ?? {})).toEqual(['effect']);
    expect(sdkPackage.peerDependencies).toBeUndefined();
    expect(sdkPackage.peerDependenciesMeta).toBeUndefined();
  });

  test('should keep the root runtime surface inside the frozen allowlist/denylist contract', async () => {
    const entry = (await import('../../index.ts')) as Record<string, unknown>;

    for (const exportName of REQUIRED_ROOT_EXPORTS) {
      expect(entry).toHaveProperty(exportName);
    }

    for (const exportName of REPRESENTATIVE_CAMEL_CASE_EXPORTS) {
      expect(entry).toHaveProperty(exportName);
    }

    for (const exportName of FORBIDDEN_ROOT_EXPORTS) {
      expect(entry).not.toHaveProperty(exportName);
    }

    expect(Object.keys(entry).filter((key) => key.endsWith('Body'))).toEqual(
      [],
    );
  });

  test('should provide release governance files with changesets and trusted publishing guardrails', () => {
    expect(() => readFileSync(CHANGESET_CONFIG_PATH, 'utf8')).not.toThrow();

    const workflows = readdirSync(WORKFLOWS_DIRECTORY)
      .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map((file) => readFileSync(resolve(WORKFLOWS_DIRECTORY, file), 'utf8'));

    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows.some((workflow) => workflow.includes('changesets'))).toBe(
      true,
    );
    expect(
      workflows.some((workflow) => workflow.includes('id-token: write')),
    ).toBe(true);
    expect(
      workflows
        .filter((workflow) => workflow.includes('setup-node'))
        .every((workflow) => workflow.includes('node-version: 24')),
    ).toBe(true);
    expect(workflows.some((workflow) => workflow.includes('11.5.1'))).toBe(
      true,
    );
  });

  test('should pack a consumer-safe tarball and allow only approved runtime imports', async () => {
    const startedAt = new Date().toISOString();
    const candidate = await fingerprint(projectRoot);
    const packageDirectory = resolve(
      projectRoot,
      '.artifacts/testing/package',
      crypto.randomUUID(),
    );
    mkdirSync(packageDirectory, { recursive: true });
    const packCommand = [
      'npm',
      'pack',
      ...(process.env.HANA_PACKAGE_SPEC ? [process.env.HANA_PACKAGE_SPEC] : []),
      '--json',
      '--pack-destination',
      packageDirectory,
    ];
    const packResult = run(packCommand, projectRoot);
    expect(packResult.exitCode).toBe(0);

    // npm < 12 返回数组；npm >= 12 返回按包名键控的对象。
    const packOutput = JSON.parse(packResult.stdout) as
      | Array<PackEntry>
      | Record<string, PackEntry>;
    const packEntries = Array.isArray(packOutput)
      ? packOutput
      : Object.values(packOutput);
    const [{ filename, integrity, files = [] } = { filename: '', files: [] }] =
      packEntries;
    const filePaths = files.map((file) => file.path);

    expect(filename.length).toBeGreaterThan(0);
    expect(filePaths).toContain('dist/index.d.ts');
    expect(filePaths).toContain('dist/index.js');
    expect(filePaths).toContain('dist/core.d.ts');
    expect(filePaths).toContain('dist/core.js');
    expect(filePaths).toContain('dist/utils.d.ts');
    expect(filePaths).toContain('dist/utils.js');
    expect(filePaths).toContain('dist/schemas.d.ts');
    expect(filePaths).toContain('dist/schemas.js');
    expect(filePaths).toContain('dist/api/song_detail.d.ts');
    expect(filePaths).toContain('dist/api/song_detail.js');
    expect(filePaths).toContain('dist/schemas/song_detail.d.ts');
    expect(filePaths).toContain('dist/schemas/song_detail.js');
    expect(filePaths).toContain('dist/watchman.js');
    expect(filePaths).toContain('dist/watchman.d.ts');
    expect(filePaths.some((file) => file.endsWith('/tool.min.js'))).toBe(false);
    expect(filePaths.some((file) => file.startsWith('docs/'))).toBe(false);
    expect(filePaths.some((file) => file.startsWith('src/server/'))).toBe(
      false,
    );
    expect(filePaths.some((file) => file.startsWith('src/demo/'))).toBe(false);
    expect(
      filePaths.filter((file) => !file.startsWith('dist/')).toSorted(),
    ).toEqual(['LICENSE', 'README.md', 'package.json']);

    const consumerDirectory = mkdtempSync(
      join(tmpdir(), 'hana-music-api-sdk-consumer-'),
    );
    const tarballPath = resolve(packageDirectory, filename);
    const runtimes: Array<{
      runtime: string;
      version: string;
      exitCode: number;
      status: number;
    }> = [];
    let consumerExit = 1;
    let browserEvidence: unknown;
    let distAuditEvidence: unknown;
    let treeShakingEvidence: unknown;
    const subpathEvidence: Array<unknown> = [];
    const libraryPlayback: Array<unknown> = [];
    const accountSocial: Array<unknown> = [];
    const podcastVideo: Array<unknown> = [];
    const membershipBusiness: Array<unknown> = [];
    const requestIdentity: Array<unknown> = [];
    const moduleConfig: Array<unknown> = [];
    const specialChains: Array<unknown> = [];
    const searchDiscovery: Array<unknown> = [];

    try {
      writeFileSync(
        resolve(consumerDirectory, 'package.json'),
        JSON.stringify(
          {
            name: 'hana-music-api-sdk-consumer-fixture',
            private: true,
            type: 'module',
          },
          null,
          2,
        ),
      );

      // 阶段 A：最小干净安装（零 optional peerDependencies）。
      const installResult = run(
        ['npm', 'install', '--no-package-lock', tarballPath, '@types/node@24'],
        consumerDirectory,
      );
      expect(installResult.exitCode, installResult.stderr).toBe(0);
      for (const excludedPackage of [
        'hono',
        'undici',
        'music-metadata',
        'qrcode',
      ]) {
        expect(
          existsSync(
            resolve(consumerDirectory, 'node_modules', excludedPackage),
          ),
          `minimal install must not include ${excludedPackage}`,
        ).toBe(false);
      }
      for (const path of filePaths) {
        expect(
          readFileSync(
            resolve(consumerDirectory, 'node_modules/hana-music-api', path),
          ),
          path,
        ).toEqual(readFileSync(resolve(projectRoot, path)));
      }
      expect(integrity).toBe(
        `sha512-${createHash('sha512').update(readFileSync(tarballPath)).digest('base64')}`,
      );
      const installedDistDirectory = resolve(
        consumerDirectory,
        'node_modules/hana-music-api/dist',
      );
      expect(
        await findForbiddenArtifactSymbols(installedDistDirectory),
      ).toEqual([]);
      distAuditEvidence = auditInstalledDist(installedDistDirectory);

      const importScript = resolve(consumerDirectory, 'watchman-import.mjs');
      writeFileSync(
        importScript,
        `
        import { strict as assert } from 'node:assert';
        for (const name of ['window', 'document']) Object.defineProperty(globalThis, name, {
          configurable: true, get() { throw new Error('DOM accessed at import'); }
        });
        const root = await import('hana-music-api');
        const { initializeWatchman, WatchmanError } = await import('hana-music-api/watchman');
        assert.equal(root.initializeWatchman, undefined);
        for (const name of ['window', 'document']) delete globalThis[name];
        await assert.rejects(initializeWatchman(), error => error instanceof WatchmanError && error.code === 'environment');
      `,
      );
      for (const runtime of ['node', 'bun']) {
        const imported = run(
          [runtime, '--import', OFFLINE_PROCESS_PATH, importScript],
          consumerDirectory,
        );
        expect(imported.exitCode, imported.stderr).toBe(0);
      }

      const browserEntry = resolve(consumerDirectory, 'browser-entry.mjs');
      writeFileSync(
        browserEntry,
        "import { initializeWatchman } from 'hana-music-api/watchman'; globalThis.initializeWatchman = initializeWatchman;",
      );
      const browserBuild = await Bun.build({
        entrypoints: [browserEntry],
        target: 'browser',
        format: 'esm',
        metafile: true,
      });
      expect(browserBuild.success).toBe(true);
      expect(browserBuild.metafile).toBeDefined();
      const browserInputs = Object.keys(browserBuild.metafile!.inputs);
      expect(
        browserInputs.some((path) =>
          /(?:node:|\/effect\/|\/hono\/|\/src\/core\/)/.test(path),
        ),
      ).toBe(false);
      expect(
        Object.values(browserBuild.metafile!.inputs)
          .flatMap((entry) => entry.imports)
          .filter((entry) => entry.external),
      ).toEqual([]);
      writeFileSync(
        resolve(packageDirectory, 'browser-metafile.json'),
        JSON.stringify(browserBuild.metafile, null, 2),
      );
      const browserSource = await browserBuild.outputs[0]!.text();
      const browser = await chromium.launch();
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const unexpected: Array<string> = [];
        let scriptLoads = 0;
        await context.route('**/*', async (route) => {
          const url = route.request().url();
          if (url === 'http://127.0.0.1:31808/') {
            await route.fulfill({
              contentType: 'text/html',
              headers: {
                'Content-Security-Policy':
                  "default-src 'none'; script-src 'nonce-watchman-nonce'; connect-src 'none'",
              },
              body: '<script nonce="watchman-nonce" type="module" src="/browser.js"></script>',
            });
          } else if (url === 'http://127.0.0.1:31808/browser.js') {
            await route.fulfill({
              contentType: 'text/javascript',
              body: browserSource,
            });
          } else if (url === 'https://acstatic-dun.126.net/tool.min.js') {
            scriptLoads++;
            await route.fulfill({
              contentType: 'text/javascript',
              body: `
              let calls = 0;
              window.initWatchman = options => options.onload({ getToken(key, callback) {
                if (key !== 'bd5d2f973ef74cd2a61325a412ae54d9') throw new Error('wrong business key');
                callback('package-token-' + ++calls);
              }});
            `,
            });
          } else {
            unexpected.push(url);
            await route.abort();
          }
        });
        const page = await context.newPage();
        const pageErrors: Array<string> = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await page.goto('http://127.0.0.1:31808/');
        await page.waitForFunction('Boolean(window.initializeWatchman)');
        const result = await page.evaluate(`(async () => {
          const client = await window.initializeWatchman({ nonce: 'watchman-nonce', timeoutMs: 1000 });
          const first = await client.getToken();
          const second = await client.getToken();
          return { first, second, nonce: [...document.scripts].find(script => script.src.endsWith('/tool.min.js')).nonce };
        })()`);
        expect(result).toEqual({
          first: 'package-token-1',
          second: 'package-token-2',
          nonce: 'watchman-nonce',
        });
        expect(scriptLoads).toBe(1);
        expect(unexpected).toEqual([]);
        expect(pageErrors).toEqual([]);
        browserEvidence = {
          version: browser.version(),
          scriptLoads,
          nonce: 'watchman-nonce',
          inputs: browserInputs,
        };
        await context.close();
      } finally {
        await browser.close();
      }

      const watchmanTypeSource = `
        import { initializeWatchman, WatchmanError, type WatchmanClient, type WatchmanOptions, type WatchmanErrorCode } from 'hana-music-api/watchman';
        const options: WatchmanOptions = { productNumber: 'example', protocol: 'https', nonce: 'nonce', businessKey: 'key', timeoutMs: 1000, tokenTimeoutMs: 1000 };
        const pending: Promise<WatchmanClient> = initializeWatchman(options);
        const token: Promise<string> = pending.then(client => client.getToken());
        const code: WatchmanErrorCode = new WatchmanError('environment').code;
        void token; void code;
        // @ts-expect-error Only http and https are initialization protocols.
        initializeWatchman({ protocol: 'ftp' });
        // @ts-expect-error The nonce must be a string.
        initializeWatchman({ nonce: 7 });
        // @ts-expect-error Device metadata is not an initialization option.
        initializeWatchman({ deviceId: 'device' });
        // @ts-expect-error The callback API stays behind the Promise facade.
        pending.then(client => client.getToken('key', () => {}));
        // @ts-expect-error Device metadata is not public.
        pending.then(client => client.WM_DID);
      `;
      writeFileSync(
        resolve(consumerDirectory, 'watchman-types.ts'),
        watchmanTypeSource +
          `
          // @ts-expect-error The public declaration must not introduce DOM document globals.
          void document;
          // @ts-expect-error The public declaration must not introduce DOM window globals.
          void window;
        `,
      );
      const watchmanTypes = run(
        [
          'node',
          TSC_CLI_PATH,
          '--noEmit',
          '--strict',
          '--skipLibCheck',
          'false',
          '--target',
          'ES2022',
          '--lib',
          'ES2022',
          '--types',
          '',
          '--module',
          'NodeNext',
          '--moduleResolution',
          'NodeNext',
          'watchman-types.ts',
        ],
        consumerDirectory,
      );
      expect(
        watchmanTypes.exitCode,
        watchmanTypes.stdout + watchmanTypes.stderr,
      ).toBe(0);

      writeFileSync(
        resolve(consumerDirectory, 'watchman-browser-types.ts'),
        watchmanTypeSource +
          `
          const script: HTMLScriptElement = document.createElement('script');
          const browserClient: Promise<WatchmanClient> = initializeWatchman({ nonce: script.nonce });
          void browserClient;
          // @ts-expect-error Browser consumers must not acquire Bun globals.
          void Bun.version;
          // @ts-expect-error Browser consumers must not acquire Node globals.
          void process.pid;
        `,
      );
      const browserTypes = run(
        [
          'node',
          TSC_CLI_PATH,
          '--noEmit',
          '--strict',
          '--skipLibCheck',
          'false',
          '--target',
          'ES2022',
          '--lib',
          'ES2022,DOM,DOM.Iterable',
          '--types',
          '',
          '--module',
          'NodeNext',
          '--moduleResolution',
          'NodeNext',
          'watchman-browser-types.ts',
        ],
        consumerDirectory,
      );
      expect(
        browserTypes.exitCode,
        browserTypes.stdout + browserTypes.stderr,
      ).toBe(0);

      const smokeScriptPath = resolve(consumerDirectory, 'smoke.mjs');
      writeFileSync(
        smokeScriptPath,
        [
          "import * as rootNamespace from 'hana-music-api'",
          "import { createHanaMusicApi, createRequest, generateDeviceId, getNcmFailureInfo, isNcmApiResponse, playlistSubscribe, albumSub, artistSub, invokeModule, search, songUrl } from 'hana-music-api'",
          "import { SongDetailBody } from 'hana-music-api/api/song_detail'",
          "import { AlbumBody, ArtistAlbumBody, ArtistTopSongBody } from 'hana-music-api/schemas'",
          "import { deepStrictEqual } from 'node:assert'",
          '',
          "if ('SongDetailBody' in rootNamespace || 'AlbumBody' in rootNamespace || 'LoginCellphoneRiskBody' in rootNamespace) throw new Error('root entry must not value-export runtime *Body schemas')",
          `const recordedArtistAlbum = ${JSON.stringify(artistAlbum.response.body)}`,
          "deepStrictEqual(await ArtistAlbumBody['~standard'].validate(recordedArtistAlbum), { value: recordedArtistAlbum })",
          `const recordedAlbum = ${JSON.stringify(albumNoDescription.response.body)}`,
          "deepStrictEqual(await AlbumBody['~standard'].validate(recordedAlbum), { value: recordedAlbum })",
          `const recordedSongDetail = ${JSON.stringify(songDetailPrivileges.response.body)}`,
          "deepStrictEqual(await SongDetailBody['~standard'].validate(recordedSongDetail), { value: recordedSongDetail })",
          `const recordedArtistTopSong = ${JSON.stringify(artistTopSong.response.body)}`,
          "deepStrictEqual(await ArtistTopSongBody['~standard'].validate(recordedArtistTopSong), { value: recordedArtistTopSong })",
          '',
          'const requests = []',
          'const fetcher = async (input, init) => {',
          '  requests.push({ url: input instanceof Request ? input.url : String(input), method: init?.method, headers: new Headers(init?.headers) })',
          '  return new Response(JSON.stringify({ code: 200, result: { songs: [] }, data: [], lrc: { lyric: "sample" }, songs: [], privileges: [], playlist: { id: 7, trackIds: [] } }), {',
          "    headers: { 'content-type': 'application/json' },",
          '  })',
          '}',
          '',
          "if (typeof createHanaMusicApi !== 'function') throw new Error('missing createHanaMusicApi')",
          "if (typeof invokeModule !== 'function') throw new Error('missing invokeModule')",
          "if (typeof search !== 'function') throw new Error('missing root search export')",
          "if (typeof songUrl !== 'function') throw new Error('missing root songUrl export')",
          'const deviceId = generateDeviceId()',
          "if (!/^[0-9A-F]{52}$/.test(deviceId)) throw new Error('invalid generated device ID')",
          "const config = { state: { deviceId }, fetcher, cookie: { MUSIC_A: 'consumer-test-token' } }",
          'const client = createHanaMusicApi(config)',
          "const clientSearchResult = await client.search({ keywords: 'demo' })",
          "const rawSearchResult = await search({ keywords: 'demo' }, config)",
          "const invokedSearchResult = await invokeModule('search', { keywords: 'demo' }, config)",
          "if (clientSearchResult.status !== 200) throw new Error('client search call failed')",
          "if (rawSearchResult.status !== 200) throw new Error('raw search call failed')",
          "if (invokedSearchResult.status !== 200) throw new Error('invokeModule search call failed')",
          "for (const entry of requests) if (entry.url !== 'https://interface.music.163.com/eapi/search/get' || entry.method !== 'POST') throw new Error('packaged search action failed')",
          'await client.lyric({ id: 7 })',
          'await client.songDetail({ ids: [7] })',
          'await client.playlistDetail({ id: 7 })',
          "deepStrictEqual(requests.slice(3).map((entry) => entry.url), ['https://music.163.com/weapi/song/lyric', 'https://music.163.com/weapi/v3/song/detail', 'https://music.163.com/weapi/v6/playlist/detail'])",
          "if (!requests[4].headers.get('cookie').includes('os=web')) throw new Error('packaged song detail profile failed')",
          "const subscription = await playlistSubscribe({ id: 17, t: 1 }, { ...config, cookie: 'MUSIC_U=package-listener; os=iphone', checkToken: 'package-token' })",
          'const write = requests.at(-1)',
          "if (subscription.status !== 200 || write.url !== 'https://music.163.com/weapi/playlist/subscribe' || write.method !== 'POST' || write.headers.get('X-antiCheatToken') !== 'package-token' || !write.headers.get('cookie').includes('os=web') || !write.headers.get('cookie').includes('MUSIC_U=package-listener')) throw new Error('packaged playlist contract failed')",
          'let tokenProviders = 0',
          'for (const [call, route] of [[albumSub, "album"], [artistSub, "artist"]]) {',
          '  for (const t of [1, 0]) for (const mode of ["none", "string", "provider"]) {',
          '    const token = mode === "none" ? undefined : mode === "string" ? "package-collection" : async () => { tokenProviders++; return "package-collection" }',
          '    const result = await call({ id: 17, t }, { ...config, checkToken: token })',
          '    const entry = requests.at(-1)',
          '    if (result.status !== 200 || entry.url !== `https://music.163.com/weapi/${route}/${t === 1 ? "sub" : "unsub"}` || entry.method !== "POST" || entry.headers.get("X-antiCheatToken") !== (mode === "none" ? null : "package-collection") || !entry.headers.get("cookie").includes("os=web") || entry.headers.get("cookie").includes("appver=")) throw new Error("packaged collection action failed")',
          '  }',
          '}',
          'if (requests.length !== 19 || tokenProviders !== 4) throw new Error("unexpected packaged collection sends or providers")',
          "if (typeof isNcmApiResponse !== 'function' || typeof getNcmFailureInfo !== 'function') throw new Error('missing packaged failure helpers')",
          "const refusalFetcher = async () => new Response(JSON.stringify({ code: 403, msg: 'package-refusal' }), { headers: { 'content-type': 'application/json' } })",
          "const namedFailure = await search({ keywords: 'demo' }, { ...config, fetcher: refusalFetcher }).catch((error) => error)",
          'const clientFailure = await client.album({ id: 7 }, { fetcher: refusalFetcher }).catch((error) => error)',
          "const invokedFailure = await invokeModule('album', { id: 7 }, { ...config, fetcher: refusalFetcher }).catch((error) => error)",
          "const rawFailure = await createRequest('/api/v1/album/7', {}, { crypto: 'api', state: { deviceId }, fetcher: refusalFetcher }).catch((error) => error)",
          'for (const failure of [namedFailure, clientFailure, invokedFailure, rawFailure])',
          "  if (!isNcmApiResponse(failure)) throw new Error('packaged failure is not a response envelope')",
          "deepStrictEqual(getNcmFailureInfo(namedFailure), { kind: 'business', code: 403, message: 'package-refusal' })",
          "deepStrictEqual(getNcmFailureInfo(clientFailure), { kind: 'business', code: 403, message: 'package-refusal' })",
          "deepStrictEqual(getNcmFailureInfo(invokedFailure), { kind: 'business', code: 403, message: 'package-refusal' })",
          "deepStrictEqual(getNcmFailureInfo(rawFailure), { kind: 'business', code: 403, message: 'package-refusal' })",
          "process.stdout.write(JSON.stringify({ runtime: typeof Bun === 'undefined' ? 'node' : 'bun', version: typeof Bun === 'undefined' ? process.versions.node : Bun.version, status: subscription.status }))",
        ].join('\n'),
      );

      for (const runtime of ['node', 'bun']) {
        const smokeResult = run(
          [runtime, '--import', OFFLINE_PROCESS_PATH, smokeScriptPath],
          consumerDirectory,
        );
        expect(smokeResult.exitCode, smokeResult.stderr).toBe(0);
        const output = JSON.parse(smokeResult.stdout) as {
          runtime: string;
          version: string;
          status: number;
        };
        expect(output.runtime).toBe(runtime);
        runtimes.push({ ...output, exitCode: smokeResult.exitCode });
      }

      // 阶段 A：公开子路径、createClient 与零可选依赖协议边界验证（Node 24 + Bun）。
      const subpathScriptPath = resolve(
        consumerDirectory,
        'subpaths-and-boundaries.mjs',
      );
      writeFileSync(
        subpathScriptPath,
        [
          "import { strict as assert } from 'node:assert'",
          "import { createDecipheriv } from 'node:crypto'",
          "import { createHanaMusicApi, search } from 'hana-music-api'",
          "import { songDetail, SongDetailBody as ApiSongDetailBody } from 'hana-music-api/api/song_detail'",
          "import { loginQrCreate } from 'hana-music-api/api/login_qr_create'",
          "import { verifyGetQr } from 'hana-music-api/api/verify_getQr'",
          "import { cloud } from 'hana-music-api/api/cloud'",
          "import { SongDetailBody as SingleSongDetailBody } from 'hana-music-api/schemas/song_detail'",
          "import { LoginCellphoneRiskBody, SongDetailBody as BarrelSongDetailBody } from 'hana-music-api/schemas'",
          "import { createClient, createOption as coreCreateOption, createRequest, generateDeviceId as coreGenerateDeviceId, getNcmFailureInfo as coreGetNcmFailureInfo, isNcmApiResponse as coreIsNcmApiResponse } from 'hana-music-api/core'",
          "import { createOption, generateDeviceId, getNcmFailureInfo, isNcmApiResponse } from 'hana-music-api/utils'",
          '',
          'assert.equal(ApiSongDetailBody, SingleSongDetailBody)',
          'assert.equal(SingleSongDetailBody, BarrelSongDetailBody)',
          "assert.equal(typeof LoginCellphoneRiskBody['~standard'].validate, 'function')",
          'assert.equal(createOption, coreCreateOption)',
          'assert.equal(generateDeviceId, coreGenerateDeviceId)',
          'assert.equal(getNcmFailureInfo, coreGetNcmFailureInfo)',
          'assert.equal(isNcmApiResponse, coreIsNcmApiResponse)',
          'assert.match(generateDeviceId(), /^[0-9A-F]{52}$/)',
          "assert.equal(createOption({ crypto: 'api' }).crypto, 'api')",
          "assert.equal('proxy' in createOption({ crypto: 'api', proxy: 'http://127.0.0.1:8080' }), false)",
          '',
          `const recordedSongDetail = ${JSON.stringify(songDetailPrivileges.response.body)}`,
          "assert.deepEqual(await SingleSongDetailBody['~standard'].validate(recordedSongDetail), { value: recordedSongDetail })",
          '',
          'let songDetailRequests = 0',
          'const sharedFetcher = async () => {',
          '  songDetailRequests += 1',
          '  return Response.json(recordedSongDetail)',
          '}',
          'const scoped = createClient(',
          '  { songDetail },',
          "  { cookie: { MUSIC_A: 'scoped-anon' }, cache: { enabled: true }, fetcher: sharedFetcher, state: { deviceId: generateDeviceId() } },",
          ')',
          'assert.deepEqual(Object.keys(scoped), ["songDetail"])',
          'const firstDetail = await scoped.songDetail({ ids: [7] })',
          'const secondDetail = await scoped.songDetail({ ids: [7] })',
          'assert.equal(firstDetail.status, 200)',
          'assert.equal(secondDetail.status, 200)',
          'assert.equal(songDetailRequests, 1)',
          "assert.throws(() => createClient({ songDetail }, { crypto: 'api' }), TypeError)",
          "assert.throws(() => createClient({ songDetail }, { proxy: 'http://127.0.0.1:8080' }), TypeError)",
          "assert.throws(() => createHanaMusicApi({ proxy: 'http://127.0.0.1:8080' }), TypeError)",
          'assert.throws(() => createClient({ broken: () => {} }), TypeError)',
          '',
          '// 二维码接口仅返回协议链接与票据，不生成 qrimg；已移除的 qrimg 键明确拒绝。',
          "const qrResult = await loginQrCreate({ key: 'sample-key' })",
          'assert.equal(qrResult.status, 200)',
          "assert.deepEqual(qrResult.body, { code: 200, data: { qrurl: 'https://music.163.com/login?codekey=sample-key' } })",
          "const qrRejected = await loginQrCreate({ key: 'sample-key', qrimg: true }).catch((error) => error)",
          'assert.equal(isNcmApiResponse(qrRejected), true)',
          'assert.equal(qrRejected.status, 400)',
          "assert.equal(getNcmFailureInfo(qrRejected)?.kind, 'invalidRequest')",
          'const verifyQrResult = await verifyGetQr(',
          "  { vid: '1', type: 1, token: 'tok', evid: 'ev', sign: 'sig' },",
          '  {',
          "    cookie: 'MUSIC_U=qr-test',",
          '    state: { deviceId: generateDeviceId() },',
          "    fetcher: async () => Response.json({ code: 200, data: { qrCode: 'qr-ticket' } }),",
          '  },',
          ')',
          'assert.equal(verifyQrResult.status, 200)',
          'assert.deepEqual(verifyQrResult.body, {',
          '  code: 200,',
          '  data: {',
          "    qrCode: 'qr-ticket',",
          '    qrurl: \'https://st.music.163.com/encrypt-pages?qrCode=qr-ticket&verifyToken=tok&verifyId=1&verifyType=1&params={"event_id":"ev","sign":"sig"}\',',
          '  },',
          '})',
          '',
          '// cloud 支持显式传入 song/artist/album，缺省时回退至文件名与默认标签。',
          'const runCloudCase = async (extraInput) => {',
          '  const cloudResponses = [',
          '    { code: 200, needUpload: false, songId: 117 },',
          "    { code: 200, result: { resourceId: 'resource-1' } },",
          '    { code: 200, songId: 118 },',
          '    { code: 200 },',
          '  ]',
          '  let cloudStep = 0',
          '  let infoPayload = null',
          '  const result = await cloud(',
          '    {',
          '      songFile: {',
          "        name: 'fallback-track.mp3',",
          '        data: Buffer.from([0, 255, 17, 128]),',
          '        size: 4,',
          "        mimetype: 'audio/mpeg',",
          "        md5: 'fallback-md5',",
          '      },',
          '      ...extraInput,',
          '    },',
          '    {',
          "      cookie: 'MUSIC_U=cloud-contract',",
          '      state: { deviceId: generateDeviceId() },',
          '      fetcher: async (input, init) => {',
          '        const request = new Request(input, init)',
          "        if (request.url.includes('/eapi/upload/cloud/info/v2')) {",
          "          const params = new URLSearchParams(await request.text()).get('params')",
          "          const decipher = createDecipheriv('aes-128-ecb', Buffer.from('e82ckenh8dichen8'), null)",
          "          const frame = Buffer.concat([decipher.update(Buffer.from(params, 'hex')), decipher.final()]).toString().split('-36cd479b6b5-')",
          '          infoPayload = JSON.parse(frame[1])',
          '        }',
          '        return Response.json(cloudResponses[cloudStep++])',
          '      },',
          '    },',
          '  )',
          '  return { result, cloudStep, infoPayload }',
          '}',
          'const cloudFallback = await runCloudCase({})',
          'assert.equal(cloudFallback.result.status, 200)',
          'assert.equal(cloudFallback.cloudStep, 4)',
          "assert.equal(cloudFallback.infoPayload?.song, 'fallback-track')",
          "assert.equal(cloudFallback.infoPayload?.artist, '未知艺术家')",
          "assert.equal(cloudFallback.infoPayload?.album, '未知专辑')",
          "const cloudExplicit = await runCloudCase({ song: 'Explicit Title', artist: 'Explicit Artist', album: 'Explicit Album' })",
          'assert.equal(cloudExplicit.result.status, 200)',
          'assert.equal(cloudExplicit.cloudStep, 4)',
          "assert.equal(cloudExplicit.infoPayload?.song, 'Explicit Title')",
          "assert.equal(cloudExplicit.infoPayload?.artist, 'Explicit Artist')",
          "assert.equal(cloudExplicit.infoPayload?.album, 'Explicit Album')",
          '',
          '// Node 24 与 Bun 传已移除的 proxy 配置均明确返回 invalidRequest。',
          "const runtime = typeof Bun === 'undefined' ? 'node' : 'bun'",
          "const rawProxyError = await createRequest('/api/test', {}, { crypto: 'api', domain: 'http://127.0.0.1:9', proxy: 'http://127.0.0.1:8080', state: { anonymousToken: '' } }).catch((error) => error)",
          'assert.equal(isNcmApiResponse(rawProxyError), true)',
          'assert.equal(rawProxyError.status, 400)',
          "assert.equal(getNcmFailureInfo(rawProxyError)?.kind, 'invalidRequest')",
          "const moduleProxyError = await search({ keywords: 'proxy' }, { proxy: 'http://127.0.0.1:8080' }).catch((error) => error)",
          'assert.equal(isNcmApiResponse(moduleProxyError), true)',
          'assert.equal(moduleProxyError.status, 400)',
          "assert.equal(getNcmFailureInfo(moduleProxyError)?.kind, 'invalidRequest')",
          'process.stdout.write(JSON.stringify({ runtime, songDetailRequests, cloudFallbackStep: cloudFallback.cloudStep, cloudExplicitStep: cloudExplicit.cloudStep }))',
        ].join('\n'),
      );
      for (const runtime of ['node', 'bun']) {
        const result = run(
          [runtime, '--import', OFFLINE_PROCESS_PATH, subpathScriptPath],
          consumerDirectory,
        );
        expect(result.exitCode, result.stderr).toBe(0);
        subpathEvidence.push(JSON.parse(result.stdout));
      }

      // 阶段 A：Tree-shaking 与物理隔离实测（Bun.build metafile）。
      treeShakingEvidence = await verifyConsumerTreeShaking(consumerDirectory);

      // 阶段 A：无可选 peerDependencies 的干净消费者单文件云函数冷启动零 FS 读取。
      const minimalServerlessEntry = resolve(
        consumerDirectory,
        'minimal-serverless-entry.mjs',
      );
      writeFileSync(
        minimalServerlessEntry,
        "export { innerVersion, search } from 'hana-music-api';\n",
      );
      const minimalServerlessOutdir = resolve(
        consumerDirectory,
        'serverless-out',
      );
      const minimalServerlessBuild = await Bun.build({
        entrypoints: [minimalServerlessEntry],
        format: 'esm',
        naming: 'function.mjs',
        outdir: minimalServerlessOutdir,
        target: 'node',
        metafile: true,
      });
      expect(minimalServerlessBuild.success).toBe(true);
      const minimalServerlessInputs = Object.keys(
        minimalServerlessBuild.metafile!.inputs,
      );
      expect(
        minimalServerlessInputs.some((path) =>
          /watchman|\/browser\/|\/undici\/|\/music-metadata\/|\/qrcode\//.test(
            path,
          ),
        ),
      ).toBe(false);
      const minimalServerlessRun = run(
        [
          'node',
          '--import',
          OFFLINE_PROCESS_PATH,
          '--import',
          FS_ACCESS_RECORDER_PATH,
          SERVERLESS_CONSUMER_PATH,
          resolve(minimalServerlessOutdir, 'function.mjs'),
        ],
        minimalServerlessOutdir,
      );
      expect(minimalServerlessRun.exitCode, minimalServerlessRun.stderr).toBe(
        0,
      );
      expect(JSON.parse(minimalServerlessRun.stdout)).toEqual({
        anonymousRegistrations: 1,
        fileAccesses: [],
        searchStatus: 200,
        version: sdkPackage.version,
      });

      writeFileSync(
        resolve(consumerDirectory, 'client-identities.json'),
        readFileSync(
          resolve(
            projectRoot,
            'tests/fixtures/consumers/client-identities.json',
          ),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'library-playback.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/library-playback.mjs'),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'library-playback.json'),
        JSON.stringify(
          currentRequests(
            'library-playback',
            JSON.parse(
              readFileSync(
                resolve(
                  projectRoot,
                  'tests/fixtures/requests/library-playback.json',
                ),
                'utf8',
              ),
            ),
          ),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'library-playback.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 351,
          providers: 117,
          cases: 117,
          modules: 77,
        });
        libraryPlayback.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'search-discovery.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/search-discovery.mjs'),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'search-discovery.json'),
        JSON.stringify(
          currentRequests(
            'search-discovery',
            JSON.parse(
              readFileSync(
                resolve(
                  projectRoot,
                  'tests/fixtures/requests/search-discovery.json',
                ),
                'utf8',
              ),
            ),
          ),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'search-discovery.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 387,
          providers: 129,
          cases: 129,
          modules: 55,
        });
        searchDiscovery.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'podcast-video.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/podcast-video.mjs'),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'podcast-video.json'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/requests/podcast-video.json'),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'podcast-video.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 576,
          providers: 192,
          cases: 192,
          modules: 67,
        });
        podcastVideo.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'membership-business.mjs'),
        readFileSync(
          resolve(
            projectRoot,
            'tests/fixtures/consumers/membership-business.mjs',
          ),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'membership-business.json'),
        JSON.stringify(
          currentRequests(
            'membership-business',
            JSON.parse(
              readFileSync(
                resolve(
                  projectRoot,
                  'tests/fixtures/requests/membership-business.json',
                ),
                'utf8',
              ),
            ),
          ),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'membership-business.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 414,
          providers: 138,
          cases: 138,
          modules: 50,
        });
        membershipBusiness.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'request-identity.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/request-identity.mjs'),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'request-identity.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 24,
          entries: 3,
          levels: 2,
          devices: 4,
        });
        requestIdentity.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'module-config.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/module-config.mjs'),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'module-config.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          removedKeys: 8,
          rejectedCalls: 48,
          rejectedConstructors: 16,
          nonEnumerableRejections: 48,
          queryRejections: 8,
          requests: 3,
          rawRequests: 1,
          providers: 0,
        });
        moduleConfig.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      const negativeImportScriptPath = resolve(
        consumerDirectory,
        'negative-import.mjs',
      );
      writeFileSync(
        negativeImportScriptPath,
        [
          "const blockedSpecifiers = ['hana-music-api/src/app/cli.ts', 'hana-music-api/src/sdk/generated/client-factory.generated.ts', 'hana-music-api/core/call.js', 'hana-music-api/modules/search.js', 'hana-music-api/dist/index.js']",
          'for (const specifier of blockedSpecifiers) {',
          '  let failedAsExpected = false',
          '  try {',
          '    await import(specifier)',
          '  } catch {',
          '    failedAsExpected = true',
          '  }',
          '  if (!failedAsExpected) throw new Error(`blocked import unexpectedly resolved: ${specifier}`)',
          '}',
        ].join('\n'),
      );

      for (const runtime of ['node', 'bun']) {
        const negativeImportResult = run(
          [runtime, '--import', OFFLINE_PROCESS_PATH, negativeImportScriptPath],
          consumerDirectory,
        );
        expect(negativeImportResult.exitCode, negativeImportResult.stderr).toBe(
          0,
        );
      }

      const typesFixturePath = resolve(consumerDirectory, 'types-fixture.ts');
      writeFileSync(
        typesFixturePath,
        [
          "import { createClient, createHanaMusicApi, generateDeviceId, invokeModule, likelist, lyricNew, songDetail as getSongDetail, SongDetailBody as RootSongDetailBody, songUrl, songUrlV1, type AlbumBody, type ArtistAlbumBody, type ArtistTopSongBody, type BodySchema, type CloudsearchBody, type LikelistBody, type LoginCellphoneRiskBody, type LyricNewBody, type SearchSuggestBody, type SongDetailBody, type SongUrlV1Body, type StandardSchemaV1, type CreateHanaMusicApiConfig, type ModuleResponseOf } from 'hana-music-api'",
          "import { songDetail as apiSongDetail, SongDetailBody as ApiSongDetailBody, type SongDetailInput } from 'hana-music-api/api/song_detail'",
          "import { cloud as apiCloud } from 'hana-music-api/api/cloud'",
          "import { loginQrCreate as apiLoginQrCreate } from 'hana-music-api/api/login_qr_create'",
          "import { createClient as coreCreateClient, createOption as coreCreateOption, createRequest as coreCreateRequest, generateDeviceId as coreGenerateDeviceId, getNcmFailureInfo as coreGetNcmFailureInfo, isNcmApiResponse as coreIsNcmApiResponse } from 'hana-music-api/core'",
          "import { AlbumBody as SchemasAlbumBody, LoginCellphoneRiskBody as SchemasLoginCellphoneRiskBody, SongDetailBody as SchemasSongDetailBody } from 'hana-music-api/schemas'",
          "import { SongDetailBody as SingleSongDetailBody } from 'hana-music-api/schemas/song_detail'",
          "import { createOption as utilsCreateOption, generateDeviceId as utilsGenerateDeviceId, getNcmFailureInfo as utilsGetNcmFailureInfo, isNcmApiResponse as utilsIsNcmApiResponse } from 'hana-music-api/utils'",
          '',
          '// @ts-expect-error Root entry exports *Body schemas as type-only in v7.',
          'void RootSongDetailBody',
          'const rootSongDetailTypeValue: RootSongDetailBody = {} as SongDetailBody',
          'void rootSongDetailTypeValue',
          "const subpathDetailInput: SongDetailInput = { ids: ['1'] }",
          'const scopedClient = createClient({ songDetail: apiSongDetail }, { cookie: "MUSIC_U=scoped" })',
          'const coreScopedClient = coreCreateClient({ songDetail: apiSongDetail }, { state: { deviceId: utilsGenerateDeviceId() } })',
          'const scopedCalls = () => Promise.all([scopedClient.songDetail(subpathDetailInput), coreScopedClient.songDetail(subpathDetailInput)])',
          'void scopedCalls',
          '// @ts-expect-error Scoped clients only expose modules passed to createClient.',
          'scopedClient.search({ keywords: "missing" })',
          'const bodySchemas: [BodySchema<SongDetailBody>, BodySchema<SongDetailBody>, BodySchema<SongDetailBody>, BodySchema<AlbumBody>, BodySchema<LoginCellphoneRiskBody>, StandardSchemaV1<unknown, SongDetailBody>] = [ApiSongDetailBody, SchemasSongDetailBody, SingleSongDetailBody, SchemasAlbumBody, SchemasLoginCellphoneRiskBody, SingleSongDetailBody]',
          'void bodySchemas',
          'void [coreCreateOption, coreCreateRequest, coreGenerateDeviceId, coreGetNcmFailureInfo, coreIsNcmApiResponse, utilsCreateOption, utilsGetNcmFailureInfo, utilsIsNcmApiResponse]',
          '',
          "import { createRequest, type CreateRequestOptions } from 'hana-music-api'",
          "const rawOptions: CreateRequestOptions = { crypto: 'api', ua: 'raw', headers: { 'X-Raw': 'value' }, e_r: false, acceptGzip: true }",
          "const rawCall = () => createRequest('/api/probe', {}, rawOptions)",
          'void rawCall',
          '// @ts-expect-error The internal client assembly is not a root export.',
          "import { createClientFromContext } from 'hana-music-api'",
          '// @ts-expect-error Internal dependencies are not public configuration.',
          'createHanaMusicApi({ execution: {} })',
          'void createClientFromContext',
          'const config: CreateHanaMusicApiConfig = {',
          "  cookie: 'MUSIC_U=consumer',",
          '  state: { deviceId: generateDeviceId() },',
          '}',
          '',
          '// @ts-expect-error Ordinary module config cannot select crypto.',
          "createHanaMusicApi({ crypto: 'api' })",
          '// @ts-expect-error Device identity moved into state.',
          "createHanaMusicApi({ deviceId: 'old' })",
          '// @ts-expect-error proxy option has been removed from ModuleCallConfig.',
          "createHanaMusicApi({ proxy: 'http://127.0.0.1:8080' })",
          '// @ts-expect-error qrimg input has been removed from login_qr_create.',
          "apiLoginQrCreate({ key: 'k', qrimg: true })",
          "void (() => apiCloud({ song: 'Title', artist: 'Artist', album: 'Album' }))",
          '// @ts-expect-error Arbitrary headers belong to the raw API.',
          'createHanaMusicApi({ headers: {} })',
          'const clientDefaults: CreateHanaMusicApiConfig = { cache: { enabled: true }, identityPool: { size: 2 } }',
          'void clientDefaults',
          "const rawWithRemovedProxy = () => createRequest('/api/probe', {}, {",
          '  // @ts-expect-error proxy option has been removed from CreateRequestOptions.',
          "  proxy: 'http://127.0.0.1:8080',",
          '})',
          'void rawWithRemovedProxy',
          'const api = createHanaMusicApi(config)',
          'const tokenProvider = async () => "fresh-token"',
          'const tokenClient = createHanaMusicApi({ checkToken: tokenProvider })',
          'const tokenCalls = () => Promise.all([',
          '  tokenClient.albumSub({ id: 1, t: 1 }, { checkToken: "token" }),',
          '  tokenClient.artistSub({ id: 1, t: 0 }, { checkToken: tokenProvider }),',
          '  invokeModule("search", { keywords: "token" }, { checkToken: tokenProvider }),',
          '  tokenClient.albumSub({ id: 1, t: 0 }),',
          '])',
          'void tokenCalls',
          "const stepCalls = () => Promise.all([api.playlistTracks({ op: 'add', pid: 1, tracks: [2], step: 'initial' }), invokeModule('playlist_tracks', { op: 'del', pid: 1, tracks: [2], step: 'fallback' })])",
          'void stepCalls',
          '// @ts-expect-error The stage must be initial or fallback.',
          "api.playlistTracks({ op: 'add', pid: 1, tracks: [2], step: 'auto' })",
          '// @ts-expect-error A stage is business input rather than execution config.',
          "api.playlistTracks({ op: 'add', pid: 1, tracks: [2] }, { step: 'fallback' })",
          '// @ts-expect-error Token providers must return Promise<string>.',
          'api.artistSub({ id: 1, t: 1 }, { checkToken: async () => 42 })',
          '// @ts-expect-error Tokens do not accept booleans.',
          'api.search({ keywords: "invalid" }, { checkToken: true })',
          '// @ts-expect-error Tokens belong in config rather than query.',
          'api.albumSub({ id: 1, t: 1, checkToken: "query-token" })',
          '// @ts-expect-error Client cache configuration cannot be a module query.',
          'api.innerVersion({ cache: {} })',
          '// @ts-expect-error Client identity pool configuration cannot be a module query.',
          'api.innerVersion({ identityPool: { size: 2 } })',
          "const resultPromise: Promise<ModuleResponseOf<'song_url'>> = api.songUrl({ ids: [1, 2] })",
          "const rawResultPromise: Promise<ModuleResponseOf<'song_url'>> = songUrl({ ids: [1, 2] }, config)",
          'void resultPromise',
          'void rawResultPromise',
          '',
          "declare const userPlaylists: import('hana-music-api').UserPlaylistBody",
          "declare const playlistDetail: import('hana-music-api').PlaylistDetailBody",
          "const playlists: readonly import('hana-music-api').PlaylistSummary[] = [...userPlaylists.playlist, playlistDetail.playlist]",
          "const playlistUsers: readonly import('hana-music-api').PlaylistUser[] = playlists.flatMap(({ creator, subscribers }) => [...(creator ? [creator] : []), ...(subscribers ?? [])])",
          'const playlistMetadata: [string | null | undefined, readonly string[] | null | undefined, number | null | undefined, number | null | undefined, number | null | undefined, number | null | undefined][] = playlists.map(({ description, tags, playCount, status, privacy, specialType }) => [description, tags, playCount, status, privacy, specialType])',
          'const avatarUrls: (string | null | undefined)[] = playlistUsers.map(({ avatarUrl }) => avatarUrl)',
          'void playlistMetadata',
          'void avatarUrls',
          '',
          'declare const artistAlbum: ArtistAlbumBody',
          'const artistHeader: [number | null | undefined, string | null | undefined, string | null | undefined, number | null | undefined, number | null | undefined] = [',
          '  artistAlbum.artist?.id,',
          '  artistAlbum.artist?.name,',
          '  artistAlbum.artist?.img1v1Url,',
          '  artistAlbum.artist?.musicSize,',
          '  artistAlbum.artist?.albumSize,',
          ']',
          'void artistHeader',
          '',
          "const descriptions: AlbumBody['album']['description'][] = ['description', null]",
          'const readDescription = (body: AlbumBody): string | null | undefined => body.album.description',
          'void descriptions',
          'void readDescription',
          '',
          'declare const songDetail: SongDetailBody',
          'declare const album: AlbumBody',
          'declare const artistTopSong: ArtistTopSongBody',
          'const songPrivileges: [number, number | null | undefined, number | null | undefined][] = songDetail.privileges.map(({ id, st, pl }) => [id, st, pl])',
          'const nestedPrivileges: [number | null | undefined, number | null | undefined, number | null | undefined][] = [...album.songs, ...artistTopSong.songs].map(({ privilege }) => [privilege?.id, privilege?.st, privilege?.pl])',
          'void songPrivileges',
          'void nestedPrivileges',
          '',
          'const suggestionsWithoutPlaylists: SearchSuggestBody = { code: 200, result: {} }',
          'declare const suggestions: SearchSuggestBody',
          'declare const playlistSearch: CloudsearchBody',
          'const suggestedPlaylists: [number, string | null | undefined][] = (suggestions.result.playlists ?? []).map(({ id, name }) => [id, name])',
          'const playCounts: (number | null | undefined)[] = (playlistSearch.result.playlists ?? []).map(({ playCount }) => playCount)',
          'void suggestionsWithoutPlaylists',
          'void suggestedPlaylists',
          'void playCounts',
          "type SearchAlbum = NonNullable<CloudsearchBody['result']['songs']>[number]['al']",
          "const unnamedSearchAlbum: SearchAlbum = { id: 72797942, picUrl: 'https://example.com/album.jpg' }",
          'void unnamedSearchAlbum',
          '',
          'const namedBodies: [Promise<SongDetailBody>, Promise<LikelistBody>, Promise<SongUrlV1Body>, Promise<LyricNewBody>] = [',
          "  getSongDetail({ ids: ['1'] }, config).then(({ body }) => body),",
          "  likelist({ uid: '1' }, config).then(({ body }) => body),",
          "  songUrlV1({ ids: ['1'], level: 'standard' }, config).then(({ body }) => body),",
          "  lyricNew({ id: '1' }, config).then(({ body }) => body),",
          ']',
          'void namedBodies',
          '',
          'type Json = null | boolean | number | string | Json[] | { [key: string]: Json }',
          'type Equal<Actual, Expected> = (<Value>() => Value extends Actual ? 1 : 2) extends (<Value>() => Value extends Expected ? 1 : 2) ? true : false',
          'const fieldContracts: [',
          "  Equal<SongDetailBody['songs'][number]['id'], number>,",
          "  Equal<LikelistBody['ids'], readonly number[]>,",
          "  Equal<SongUrlV1Body['data'], ReadonlyArray<SongUrlV1Body['data'][number]>>,",
          "  Equal<SongUrlV1Body['data'][number]['url'], string | null>,",
          "  Equal<LyricNewBody['pureMusic'], boolean | null | undefined>,",
          "  Equal<SongDetailBody['unverified'], Json>,",
          "  Equal<Awaited<ReturnType<typeof getSongDetail>>['body']['unverified'], Json>,",
          "  Equal<NonNullable<SearchAlbum>['name'], string | null | undefined>,",
          "  Equal<NonNullable<SongDetailBody['songs'][number]['al']>['name'], string | null | undefined>,",
          '] = [true, true, true, true, true, true, true, true, true]',
          'void fieldContracts',
        ].join('\n'),
      );

      writeFileSync(
        resolve(consumerDirectory, 'tsconfig.json'),
        JSON.stringify(
          {
            compilerOptions: {
              module: 'NodeNext',
              moduleResolution: 'NodeNext',
              noEmit: true,
              strict: true,
              skipLibCheck: true,
              target: 'ES2022',
              types: [],
            },
            include: ['types-fixture.ts'],
          },
          null,
          2,
        ),
      );

      const nodeOnlyTypecheckResult = run(
        [
          'node',
          TSC_CLI_PATH,
          '--project',
          resolve(consumerDirectory, 'tsconfig.json'),
        ],
        consumerDirectory,
      );
      expect(
        nodeOnlyTypecheckResult.exitCode,
        nodeOnlyTypecheckResult.stdout,
      ).toBe(0);

      const strictTypecheckResult = run(
        [
          'node',
          TSC_CLI_PATH,
          '--project',
          resolve(consumerDirectory, 'tsconfig.json'),
          '--skipLibCheck',
          'false',
          '--types',
          'node',
        ],
        consumerDirectory,
      );
      expect(strictTypecheckResult.exitCode, strictTypecheckResult.stdout).toBe(
        0,
      );

      // 在零可选依赖的单一干净安装下验证 account-social 与 special-chains 完整消费者契约。
      writeFileSync(
        resolve(consumerDirectory, 'account-social.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/account-social.mjs'),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'account-social.json'),
        JSON.stringify(
          currentRequests(
            'account-social',
            JSON.parse(
              readFileSync(
                resolve(
                  projectRoot,
                  'tests/fixtures/requests/account-social.json',
                ),
                'utf8',
              ),
            ),
          ),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'account-social.mjs'),
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 801,
          providers: 267,
          cases: 267,
          modules: 83,
        });
        accountSocial.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }

      writeFileSync(
        resolve(consumerDirectory, 'special-chains.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/special-chains.mjs'),
        ),
      );
      for (const runtime of ['node', 'bun']) {
        const command = [
          runtime,
          '--import',
          OFFLINE_PROCESS_PATH,
          resolve(consumerDirectory, 'special-chains.mjs'),
          sdkPackage.version!,
        ];
        const result = run(command, consumerDirectory);
        expect(result.exitCode, result.stderr).toBe(0);
        const counts = JSON.parse(result.stdout);
        expect(counts).toEqual({
          requests: 59,
          providers: 19,
          scenarios: 6,
          localProviders: 0,
          stepRequests: 18,
        });
        specialChains.push({
          runtime,
          command,
          exitCode: result.exitCode,
          counts,
          stderr: result.stderr,
        });
      }
      consumerExit = 0;
    } finally {
      await writeEvidence(
        {
          suite: 'package',
          command: packCommand,
          startedAt,
          candidate,
          exitCode: consumerExit,
          counts: {
            pass: consumerExit === 0 ? 1 : 0,
            fail: consumerExit === 0 ? 0 : 1,
            skip: 0,
          },
          artifacts: { tarball: tarballPath },
          details: {
            phase: 'consumer-validation',
            packageSpec: process.env.HANA_PACKAGE_SPEC ?? 'local',
            integrity,
            tarballSha256: createHash('sha256')
              .update(readFileSync(tarballPath))
              .digest('hex'),
            distAudit: distAuditEvidence,
            treeShaking: treeShakingEvidence,
            subpaths: subpathEvidence,
            runtimes,
            libraryPlayback,
            searchDiscovery,
            accountSocial,
            podcastVideo,
            membershipBusiness,
            requestIdentity,
            moduleConfig,
            specialChains,
            browser: browserEvidence,
            files: filePaths.map((path) => ({
              path,
              sha256: createHash('sha256')
                .update(readFileSync(resolve(projectRoot, path)))
                .digest('hex'),
            })),
          },
        },
        projectRoot,
        packageDirectory,
      );
      rmSync(consumerDirectory, { force: true, recursive: true });
    }
  }, 120_000);

  test('should load and answer first calls from a single-file serverless bundle without touching the filesystem', async () => {
    // 云函数打包会把 SDK 和依赖合成单个文件，周围既没有 package.json，也不保证能读写临时目录。
    const functionDirectory = mkdtempSync(
      join(tmpdir(), 'hana-music-api-serverless-'),
    );

    try {
      const bundle = await Bun.build({
        entrypoints: [resolve(projectRoot, 'dist/index.js')],
        format: 'esm',
        naming: 'function.mjs',
        outdir: functionDirectory,
        target: 'node',
        metafile: true,
      });
      expect(bundle.success).toBe(true);
      expect(
        Object.keys(bundle.metafile!.inputs).some((path) =>
          /watchman|\/browser\//.test(path),
        ),
      ).toBe(false);

      const coldStart = run(
        [
          'node',
          '--import',
          OFFLINE_PROCESS_PATH,
          '--import',
          FS_ACCESS_RECORDER_PATH,
          SERVERLESS_CONSUMER_PATH,
          resolve(functionDirectory, 'function.mjs'),
        ],
        functionDirectory,
      );
      expect(coldStart.exitCode, coldStart.stderr).toBe(0);
      expect(JSON.parse(coldStart.stdout)).toEqual({
        anonymousRegistrations: 1,
        fileAccesses: [],
        searchStatus: 200,
        version: sdkPackage.version,
      });
    } finally {
      rmSync(functionDirectory, { force: true, recursive: true });
    }
  }, 30_000);
});

const readPackageJson = (): PackageJsonLike =>
  JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as PackageJsonLike;

const sdkPackage = readPackageJson();

const ensureBuiltArtifacts = async (): Promise<void> => {
  const before = await fingerprint(projectRoot);
  const buildResult = run(['bun', 'run', 'build'], projectRoot);
  expect(await fingerprint(projectRoot)).toEqual(before);
  expect(buildResult.exitCode, buildResult.stderr).toBe(0);
};

const run = (cmd: Array<string>, cwd: string) => {
  const result = Bun.spawnSync({
    cmd,
    cwd,
    env: process.env,
    stderr: 'pipe',
    stdout: 'pipe',
  });

  return {
    exitCode: result.exitCode,
    stderr: Buffer.from(result.stderr).toString('utf8'),
    stdout: Buffer.from(result.stdout).toString('utf8'),
  };
};

const auditInstalledDist = (distDirectory: string) => {
  const files: Array<{ path: string; size: number }> = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push({
          path: relative(distDirectory, fullPath),
          size: statSync(fullPath).size,
        });
      }
    }
  };
  walk(distDirectory);

  const jsFiles = files.filter((file) => file.path.endsWith('.js'));
  const dtsFiles = files.filter((file) => file.path.endsWith('.d.ts'));

  const effectBarrelImports = jsFiles
    .filter((file) =>
      /\bfrom\s*['"]effect['"]/.test(
        readFileSync(join(distDirectory, file.path), 'utf8'),
      ),
    )
    .map((file) => file.path);
  expect(effectBarrelImports).toEqual([]);

  const packageJsonImports = jsFiles
    .filter((file) =>
      /package\.json/.test(
        readFileSync(join(distDirectory, file.path), 'utf8'),
      ),
    )
    .map((file) => file.path);
  expect(packageJsonImports).toEqual([]);

  const leakedEffectInternals = dtsFiles
    .filter((file) =>
      /StructWithRest|middlewareDecoding|MutableJson/.test(
        readFileSync(join(distDirectory, file.path), 'utf8'),
      ),
    )
    .map((file) => file.path);
  expect(leakedEffectInternals).toEqual([]);

  const largestDts = dtsFiles.toSorted(
    (left, right) => right.size - left.size,
  )[0];
  const largestJs = jsFiles.toSorted(
    (left, right) => right.size - left.size,
  )[0];
  expect(largestDts?.size ?? 0).toBeLessThan(MAX_SINGLE_DTS_BYTES);
  expect(largestJs?.size ?? 0).toBeLessThan(MAX_SINGLE_JS_BYTES);

  return {
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.size, 0),
    jsCount: jsFiles.length,
    jsBytes: jsFiles.reduce((sum, file) => sum + file.size, 0),
    dtsCount: dtsFiles.length,
    dtsBytes: dtsFiles.reduce((sum, file) => sum + file.size, 0),
    largestJs,
    largestDts,
  };
};

const verifyConsumerTreeShaking = async (consumerDirectory: string) => {
  const buildEntry = async (name: string, source: string) => {
    const entryPath = resolve(consumerDirectory, `${name}.mjs`);
    writeFileSync(entryPath, source);
    const result = await Bun.build({
      entrypoints: [entryPath],
      target: 'node',
      format: 'esm',
      metafile: true,
    });
    expect(result.success, name).toBe(true);
    const inputs = Object.keys(result.metafile!.inputs);
    const outputBytes = result.outputs[0]!.size;
    return { inputs, outputBytes };
  };

  const utilsBundle = await buildEntry(
    'treeshake-utils',
    "import { createOption, generateDeviceId, getNcmFailureInfo, isNcmApiResponse } from 'hana-music-api/utils'; console.log(generateDeviceId(), isNcmApiResponse({}), getNcmFailureInfo({}), createOption({}));\n",
  );
  expect(
    utilsBundle.inputs.some((path) =>
      /\/effect\/|\/undici\/|\/music-metadata\/|\/qrcode\/|\/src\/modules\/|registry\.generated/.test(
        path,
      ),
    ),
    utilsBundle.inputs.join('\n'),
  ).toBe(false);

  const rootUtilBundle = await buildEntry(
    'treeshake-root-util',
    "import { generateDeviceId } from 'hana-music-api'; console.log(generateDeviceId());\n",
  );
  expect(
    rootUtilBundle.inputs.some((path) =>
      /\/effect\/|\/undici\/|\/music-metadata\/|\/qrcode\/|\/src\/modules\/|registry\.generated/.test(
        path,
      ),
    ),
    rootUtilBundle.inputs.join('\n'),
  ).toBe(false);

  const apiSongDetailBundle = await buildEntry(
    'treeshake-api-song-detail',
    "import { songDetail } from 'hana-music-api/api/song_detail'; console.log(songDetail);\n",
  );
  const apiSongDetailModules = apiSongDetailBundle.inputs.filter((path) =>
    /\/src\/modules\/.+\.js$/.test(path),
  );
  expect(apiSongDetailModules, apiSongDetailModules.join('\n')).toHaveLength(1);
  expect(apiSongDetailModules[0]).toMatch(/\/src\/modules\/song_detail\.js$/);
  expect(
    apiSongDetailBundle.inputs.some((path) =>
      /registry\.generated|\/undici\/|\/music-metadata\/|\/qrcode\//.test(path),
    ),
    apiSongDetailBundle.inputs.join('\n'),
  ).toBe(false);

  const rootSongDetailBundle = await buildEntry(
    'treeshake-root-song-detail',
    "import { songDetail } from 'hana-music-api'; console.log(songDetail);\n",
  );
  const rootSongDetailModules = rootSongDetailBundle.inputs.filter((path) =>
    /\/src\/modules\/.+\.js$/.test(path),
  );
  expect(rootSongDetailModules, rootSongDetailModules.join('\n')).toHaveLength(
    1,
  );
  expect(rootSongDetailModules[0]).toMatch(/\/src\/modules\/song_detail\.js$/);
  expect(
    rootSongDetailBundle.inputs.some((path) =>
      /registry\.generated|\/undici\/|\/music-metadata\/|\/qrcode\//.test(path),
    ),
    rootSongDetailBundle.inputs.join('\n'),
  ).toBe(false);

  const schemaSongDetailBundle = await buildEntry(
    'treeshake-schema-song-detail',
    "import { SongDetailBody } from 'hana-music-api/schemas/song_detail'; console.log(SongDetailBody);\n",
  );
  const schemaSongDetailModules = schemaSongDetailBundle.inputs.filter((path) =>
    /\/src\/modules\/.+\.js$/.test(path),
  );
  expect(
    schemaSongDetailModules,
    schemaSongDetailModules.join('\n'),
  ).toHaveLength(1);
  expect(schemaSongDetailModules[0]).toMatch(
    /\/src\/modules\/song_detail\.js$/,
  );
  expect(
    schemaSongDetailBundle.inputs.some((path) =>
      /\/core\/call\.js|\/core\/request\.js|\/core\/transport\.js|registry\.generated|\/undici\/|\/music-metadata\/|\/qrcode\//.test(
        path,
      ),
    ),
    schemaSongDetailBundle.inputs.join('\n'),
  ).toBe(false);

  return {
    utils: {
      inputCount: utilsBundle.inputs.length,
      outputBytes: utilsBundle.outputBytes,
    },
    rootUtil: {
      inputCount: rootUtilBundle.inputs.length,
      outputBytes: rootUtilBundle.outputBytes,
    },
    apiSongDetail: {
      inputCount: apiSongDetailBundle.inputs.length,
      outputBytes: apiSongDetailBundle.outputBytes,
    },
    rootSongDetail: {
      inputCount: rootSongDetailBundle.inputs.length,
      outputBytes: rootSongDetailBundle.outputBytes,
    },
    schemaSongDetail: {
      inputCount: schemaSongDetailBundle.inputs.length,
      outputBytes: schemaSongDetailBundle.outputBytes,
    },
  };
};

type PackEntry = {
  files?: Array<{ path: string }>;
  filename: string;
  integrity?: string;
};

type PackageJsonLike = {
  dependencies?: Record<string, string>;
  engines?: Record<string, string>;
  exports?: Record<string, unknown>;
  name?: string;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  private?: boolean;
  sideEffects?: boolean;
  type?: string;
  version?: string;
};
