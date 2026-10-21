import { describe, expect, test } from 'bun:test';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { findForbiddenArtifactSymbols } from '../fixtures/architecture-artifacts.ts';
import albumNoDescription from '../fixtures/netease/library/album.no-description.json';
import artistAlbum from '../fixtures/netease/library/artist_album.json';
import artistTopSong from '../fixtures/netease/library/artist_top_song.json';
import songDetailPrivileges from '../fixtures/netease/library/song_detail.privileges.json';

const ROOT = resolve(import.meta.dir, '../..');
const PACKAGE_JSON_PATH = resolve(ROOT, 'package.json');
const WORKFLOWS_DIRECTORY = resolve(ROOT, '.github/workflows');
const CHANGESET_CONFIG_PATH = resolve(ROOT, '.changeset/config.json');
const TSC_CLI_PATH = resolve(ROOT, 'node_modules/typescript/bin/tsc');
const FS_ACCESS_RECORDER_PATH = resolve(
  ROOT,
  'tests/fixtures/fs-access-recorder.mjs',
);
const SERVERLESS_CONSUMER_PATH = resolve(
  ROOT,
  'tests/fixtures/serverless-consumer.mjs',
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
const EXPECTED_EXPORT_PATHS = ['.'];

describe('sdk release contract', () => {
  test('should expose only the root package entrypoint as the public ESM boundary', () => {
    const exportMap = sdkPackage.exports ?? {};

    expect(sdkPackage.name).toBe('hana-music-api');
    expect(sdkPackage.private).toBe(false);
    expect(sdkPackage.type).toBe('module');
    expect(sdkPackage.sideEffects).toBe(false);
    expect(Object.keys(exportMap).toSorted()).toEqual(EXPECTED_EXPORT_PATHS);
    expect(exportMap['.']).toEqual({
      types: './dist/index.d.ts',
      default: './dist/index.js',
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
    ensureBuiltArtifacts();

    const packResult = run(['npm', 'pack', '--json'], ROOT);
    expect(packResult.exitCode).toBe(0);

    // npm < 12 返回数组；npm >= 12 返回按包名键控的对象。
    const packOutput = JSON.parse(packResult.stdout) as
      | Array<PackEntry>
      | Record<string, PackEntry>;
    const packEntries = Array.isArray(packOutput)
      ? packOutput
      : Object.values(packOutput);
    const [{ filename, files = [] } = { filename: '', files: [] }] =
      packEntries;
    const filePaths = files.map((file) => file.path);

    expect(filename.length).toBeGreaterThan(0);
    expect(filePaths).toContain('dist/index.d.ts');
    expect(filePaths).toContain('dist/index.js');
    expect(filePaths.some((file) => file.startsWith('docs/'))).toBe(false);
    expect(filePaths.some((file) => file.startsWith('src/server/'))).toBe(
      false,
    );
    expect(filePaths.some((file) => file.startsWith('src/demo/'))).toBe(false);

    const consumerDirectory = mkdtempSync(
      join(tmpdir(), 'hana-music-api-sdk-consumer-'),
    );
    const tarballPath = resolve(ROOT, filename);

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
      expect(
        await findForbiddenArtifactSymbols(
          resolve(consumerDirectory, 'node_modules/hana-music-api/dist'),
        ),
      ).toEqual([]);

      const smokeScriptPath = resolve(consumerDirectory, 'smoke.mjs');
      writeFileSync(
        smokeScriptPath,
        [
          "import { AlbumBody, ArtistAlbumBody, ArtistTopSongBody, SongDetailBody, createHanaMusicApi, generateDeviceId, invokeModule, search, songUrl } from 'hana-music-api'",
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
          'const fetcher = async () => {',
          '  return new Response(JSON.stringify({ code: 200, result: { songs: [] }, data: [] }), {',
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
          "const config = { deviceId, fetcher, cookie: { MUSIC_A: 'consumer-test-token' } }",
          'const client = createHanaMusicApi(config)',
          "const clientSearchResult = await client.search({ keywords: 'demo' })",
          "const rawSearchResult = await search({ keywords: 'demo' }, config)",
          "const invokedSearchResult = await invokeModule('search', { keywords: 'demo' }, config)",
          "if (clientSearchResult.status !== 200) throw new Error('client search call failed')",
          "if (rawSearchResult.status !== 200) throw new Error('raw search call failed')",
          "if (invokedSearchResult.status !== 200) throw new Error('invokeModule search call failed')",
        ].join('\n'),
      );

      const smokeResult = run(['node', smokeScriptPath], consumerDirectory);
      expect(smokeResult.exitCode, smokeResult.stderr).toBe(0);

      const negativeImportScriptPath = resolve(
        consumerDirectory,
        'negative-import.mjs',
      );
      writeFileSync(
        negativeImportScriptPath,
        [
          "const blockedSpecifiers = ['hana-music-api/api/search', 'hana-music-api/src/app/cli.ts']",
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

      const negativeImportResult = run(
        ['node', negativeImportScriptPath],
        consumerDirectory,
      );
      expect(negativeImportResult.exitCode).toBe(0);

      const typesFixturePath = resolve(consumerDirectory, 'types-fixture.ts');
      writeFileSync(
        typesFixturePath,
        [
          "import { createHanaMusicApi, generateDeviceId, likelist, lyricNew, songDetail as getSongDetail, songUrl, songUrlV1, type AlbumBody, type ArtistAlbumBody, type ArtistTopSongBody, type CloudsearchBody, type LikelistBody, type LyricNewBody, type SearchSuggestBody, type SongDetailBody, type SongUrlV1Body, type CreateHanaMusicApiConfig, type ModuleResponseOf } from 'hana-music-api'",
          '',
          'const config: CreateHanaMusicApiConfig = {',
          "  cookie: 'MUSIC_U=consumer',",
          '  deviceId: generateDeviceId(),',
          '}',
          '',
          'const api = createHanaMusicApi(config)',
          "const resultPromise: Promise<ModuleResponseOf<'song_url'>> = api.songUrl({ id: '1,2' })",
          "const rawResultPromise: Promise<ModuleResponseOf<'song_url'>> = songUrl({ id: '1,2' }, config)",
          'void resultPromise',
          'void rawResultPromise',
          '',
          "declare const userPlaylists: import('hana-music-api').UserPlaylistBody",
          "declare const playlistDetail: import('hana-music-api').PlaylistDetailBody",
          "const playlists: readonly import('hana-music-api').PlaylistSummary[] = [...userPlaylists.playlist, playlistDetail.playlist]",
          "const playlistUsers: readonly import('hana-music-api').PlaylistUser[] = playlists.flatMap(({ creator, subscribers }) => [creator, ...(subscribers ?? [])])",
          'const playlistMetadata: [string | null, readonly string[], number, number, number, number][] = playlists.map(({ description, tags, playCount, status, privacy, specialType }) => [description, tags, playCount, status, privacy, specialType])',
          'const avatarUrls: (string | undefined)[] = playlistUsers.map(({ avatarUrl }) => avatarUrl)',
          'void playlistMetadata',
          'void avatarUrls',
          '',
          'declare const artistAlbum: ArtistAlbumBody',
          'const artistHeader: [number, string, string, number, number] = [',
          '  artistAlbum.artist.id,',
          '  artistAlbum.artist.name,',
          '  artistAlbum.artist.img1v1Url,',
          '  artistAlbum.artist.musicSize,',
          '  artistAlbum.artist.albumSize,',
          ']',
          'void artistHeader',
          '',
          "const descriptions: AlbumBody['album']['description'][] = ['description', null]",
          'const readDescription = (body: AlbumBody): string | null => body.album.description',
          'void descriptions',
          'void readDescription',
          '',
          'declare const songDetail: SongDetailBody',
          'declare const album: AlbumBody',
          'declare const artistTopSong: ArtistTopSongBody',
          'const privileges: number[][] = [',
          '  ...songDetail.privileges.map(({ id, st, pl }) => [id, st, pl]),',
          '  ...album.songs.map(({ privilege }) => [privilege.id, privilege.st, privilege.pl]),',
          '  ...artistTopSong.songs.map(({ privilege }) => [privilege.id, privilege.st, privilege.pl]),',
          ']',
          'void privileges',
          '',
          'const suggestionsWithoutPlaylists: SearchSuggestBody = { code: 200, result: {} }',
          'declare const suggestions: SearchSuggestBody',
          'declare const playlistSearch: CloudsearchBody',
          'const suggestedPlaylists: [number, string][] = (suggestions.result.playlists ?? []).map(({ id, name }) => [id, name])',
          'const playCounts: number[] = (playlistSearch.result.playlists ?? []).map(({ playCount }) => playCount)',
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
          "  Equal<LyricNewBody['pureMusic'], boolean | undefined>,",
          "  Equal<SongDetailBody['unverified'], Json>,",
          "  Equal<Awaited<ReturnType<typeof getSongDetail>>['body']['unverified'], Json>,",
          "  Equal<SearchAlbum['name'], string | null | undefined>,",
          "  Equal<SongDetailBody['songs'][number]['al']['name'], string | null>,",
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
    } finally {
      rmSync(consumerDirectory, { force: true, recursive: true });
      if (filename.length > 0) {
        rmSync(resolve(ROOT, basename(filename)), { force: true });
      }
    }
  }, 30_000);

  test('should load and answer first calls from a single-file serverless bundle without touching the filesystem', async () => {
    ensureBuiltArtifacts();

    // 云函数打包会把 SDK 和依赖合成单个文件，周围既没有 package.json，也不保证能读写临时目录。
    const functionDirectory = mkdtempSync(
      join(tmpdir(), 'hana-music-api-serverless-'),
    );

    try {
      const bundle = await Bun.build({
        entrypoints: [resolve(ROOT, 'dist/index.js')],
        format: 'esm',
        naming: 'function.mjs',
        outdir: functionDirectory,
        target: 'node',
      });
      expect(bundle.success).toBe(true);

      const coldStart = run(
        [
          'node',
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

const ensureBuiltArtifacts = (): void => {
  const buildOutputPath = resolve(ROOT, 'dist/index.js');

  try {
    readFileSync(buildOutputPath, 'utf8');
    return;
  } catch {}

  const buildResult = run(['bun', 'run', 'build'], ROOT);
  expect(buildResult.exitCode).toBe(0);
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
};

type PackageJsonLike = {
  exports?: Record<string, unknown>;
  name?: string;
  private?: boolean;
  sideEffects?: boolean;
  type?: string;
  version?: string;
};
