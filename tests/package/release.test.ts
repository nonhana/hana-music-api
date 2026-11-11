import { beforeAll, describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { chromium } from 'playwright';

import { findForbiddenArtifactSymbols } from '../_kit/artifacts.ts';
import { projectRoot } from '../_kit/assertions.ts';
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
  'createHanaMusicApi',
  'invokeModule',
  'createRequest',
  'createOption',
  'generateDeviceId',
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
];
const EXPECTED_EXPORT_PATHS = ['.', './watchman'];

describe('sdk release contract', () => {
  beforeAll(ensureBuiltArtifacts, 60_000);
  test('should expose the root and isolated watchman package entrypoints', () => {
    const exportMap = sdkPackage.exports ?? {};

    expect(sdkPackage.name).toBe('hana-music-api');
    expect(sdkPackage.private).toBe(false);
    expect(sdkPackage.type).toBe('module');
    expect(sdkPackage.sideEffects).toBe(false);
    expect(sdkPackage.engines).toEqual({ node: '>=24' });
    expect(Object.keys(exportMap).toSorted()).toEqual(EXPECTED_EXPORT_PATHS);
    expect(exportMap['.']).toEqual({
      types: './dist/index.d.ts',
      default: './dist/index.js',
    });
    expect(exportMap['./watchman']).toEqual({
      types: './dist/watchman.d.ts',
      default: './dist/watchman.js',
    });
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

      const installResult = run(
        ['npm', 'install', '--no-package-lock', tarballPath, '@types/node@24'],
        consumerDirectory,
      );
      expect(installResult.exitCode).toBe(0);
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
      expect(
        await findForbiddenArtifactSymbols(
          resolve(consumerDirectory, 'node_modules/hana-music-api/dist'),
        ),
      ).toEqual([]);

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
          "import { AlbumBody, ArtistAlbumBody, ArtistTopSongBody, SongDetailBody, createHanaMusicApi, generateDeviceId, playlistSubscribe, albumSub, artistSub, invokeModule, search, songUrl } from 'hana-music-api'",
          "import { deepStrictEqual } from 'node:assert'",
          '',
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
          'await client.songDetail({ ids: 7 })',
          'await client.playlistDetail({ id: 7 })',
          "deepStrictEqual(requests.slice(3).map((entry) => entry.url), ['https://interface.music.163.com/eapi/song/lyric', 'https://music.163.com/weapi/v3/song/detail', 'https://interface.music.163.com/eapi/v6/playlist/detail'])",
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
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/requests/library-playback.json'),
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
          requests: 366,
          providers: 122,
          cases: 122,
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
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/requests/search-discovery.json'),
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
          requests: 432,
          providers: 144,
          cases: 144,
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
        resolve(consumerDirectory, 'account-social.mjs'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/consumers/account-social.mjs'),
        ),
      );
      writeFileSync(
        resolve(consumerDirectory, 'account-social.json'),
        readFileSync(
          resolve(projectRoot, 'tests/fixtures/requests/account-social.json'),
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
          requests: 1110,
          providers: 370,
          cases: 370,
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
        readFileSync(
          resolve(
            projectRoot,
            'tests/fixtures/requests/membership-business.json',
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
          requests: 720,
          providers: 240,
          cases: 240,
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
          removedKeys: 7,
          rejectedCalls: 42,
          rejectedConstructors: 14,
          nonEnumerableRejections: 42,
          queryRejections: 7,
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
          requests: 21,
          providers: 6,
          scenarios: 3,
          localProviders: 0,
        });
        specialChains.push({
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
          "const blockedSpecifiers = ['hana-music-api/api/search', 'hana-music-api/src/app/cli.ts', 'hana-music-api/src/sdk/generated/client-factory.generated.ts']",
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
          "import { createHanaMusicApi, generateDeviceId, invokeModule, likelist, lyricNew, songDetail as getSongDetail, songUrl, songUrlV1, type AlbumBody, type ArtistAlbumBody, type ArtistTopSongBody, type CloudsearchBody, type LikelistBody, type LyricNewBody, type SearchSuggestBody, type SongDetailBody, type SongUrlV1Body, type CreateHanaMusicApiConfig, type ModuleResponseOf } from 'hana-music-api'",
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
          '// @ts-expect-error Arbitrary headers belong to the raw API.',
          'createHanaMusicApi({ headers: {} })',
          'const clientDefaults: CreateHanaMusicApiConfig = { cache: { enabled: true }, identityPool: { size: 2 } }',
          'void clientDefaults',
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
          "const resultPromise: Promise<ModuleResponseOf<'song_url'>> = api.songUrl({ id: '1,2' })",
          "const rawResultPromise: Promise<ModuleResponseOf<'song_url'>> = songUrl({ id: '1,2' }, config)",
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
          "  getSongDetail({ ids: '1' }, config).then(({ body }) => body),",
          "  likelist({ uid: '1' }, config).then(({ body }) => body),",
          "  songUrlV1({ id: '1' }, config).then(({ body }) => body),",
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
  }, 60_000);

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

type PackEntry = {
  files?: Array<{ path: string }>;
  filename: string;
  integrity?: string;
};

type PackageJsonLike = {
  engines?: Record<string, string>;
  exports?: Record<string, unknown>;
  name?: string;
  private?: boolean;
  sideEffects?: boolean;
  type?: string;
  version?: string;
};
