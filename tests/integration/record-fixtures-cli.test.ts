import { describe, expect, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const repoRoot = resolve(import.meta.dir, '../..');
const recordScript = join(repoRoot, 'scripts/record-fixtures.mts');
const auditScript = join(repoRoot, 'scripts/schema-audit.mts');

// 预加载脚本替换全局 fetch：CLI 和 SDK 的匿名注册预取都走它，测试不访问网络。
const preloadSource = `
import { appendFileSync } from 'node:fs';

const defaultBody = process.env.FAKE_BODY ?? '{"code":200}';
const defaultStatus = Number(process.env.FAKE_STATUS ?? '200');
const routes = JSON.parse(process.env.FAKE_ROUTES ?? 'null');
const log = process.env.FAKE_LOG;
const failedOnce = new Set();

globalThis.fetch = async (input, init) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const { pathname } = new URL(url);
  let route;
  let routeKey;
  if (routes) {
    for (const [suffix, value] of Object.entries(routes)) {
      if (pathname.endsWith(suffix)) {
        route = value;
        routeKey = suffix;
        break;
      }
    }
  }
  if (log) {
    const headers = new Headers(init?.headers);
    appendFileSync(
      log,
      \`\${JSON.stringify({ url, cookie: headers.get('cookie') })}\\n\`,
    );
  }
  if (route?.error !== undefined) {
    if (route.errorOnce === true) {
      if (!failedOnce.has(routeKey)) {
        failedOnce.add(routeKey);
        throw new Error(String(route.error));
      }
    } else {
      throw new Error(String(route.error));
    }
  }
  const response = new Response(
    route === undefined ? defaultBody : JSON.stringify(route.body),
    {
      status: route?.status ?? defaultStatus,
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'MUSIC_A=preload-token; Path=/',
      },
    },
  );
  if (typeof response.headers.getSetCookie !== 'function') {
    response.headers.getSetCookie = () => ['MUSIC_A=preload-token; Path=/'];
  }
  return response;
};
`;

type RecordedFile = {
  readonly module: string;
  readonly query: Record<string, unknown>;
  readonly context: Record<string, unknown> & {
    readonly outcome?: string;
    readonly part?: {
      readonly final: boolean;
      readonly gaps?: ReadonlyArray<number>;
      readonly index: number;
      readonly of: number;
    };
    readonly redacted?: ReadonlyArray<string>;
    readonly viewer?: string;
  };
  readonly response: { readonly status: number; readonly body: unknown };
};

type Workspace = {
  readonly root: string;
  readonly preload: string;
  readonly out: string;
  readonly requestLog: string;
  readonly env: Record<string, string>;
};

type RunResult = {
  readonly code: number | null;
  readonly stderr: string;
  readonly stdout: string;
};

const createWorkspace = async (
  body: unknown,
  options: {
    readonly routes?: Record<
      string,
      {
        readonly body?: unknown;
        readonly error?: string;
        readonly errorOnce?: boolean;
        readonly status?: number;
      }
    >;
    readonly env?: Record<string, string>;
    readonly status?: number;
  } = {},
): Promise<Workspace> => {
  const root = await mkdtemp(join(tmpdir(), 'hana-record-cli-'));
  const preload = join(root, 'preload.ts');
  const out = join(root, 'out');
  const requestLog = join(root, 'requests.jsonl');
  await writeFile(preload, preloadSource, 'utf8');
  return {
    root,
    preload,
    out,
    requestLog,
    env: {
      FAKE_BODY: JSON.stringify(body),
      FAKE_LOG: requestLog,
      HANA_TEST_FIXTURES_ROOT: join(root, 'fixtures'),
      ...(options.routes === undefined
        ? {}
        : { FAKE_ROUTES: JSON.stringify(options.routes) }),
      ...(options.status === undefined
        ? {}
        : { FAKE_STATUS: String(options.status) }),
      ...options.env,
    },
  };
};

const run = (
  workspace: Workspace,
  script: string,
  args: ReadonlyArray<string>,
  extraEnv: Record<string, string> = {},
): RunResult => {
  const result = Bun.spawnSync(
    ['bun', '--preload', workspace.preload, script, ...args],
    {
      cwd: repoRoot,
      env: { ...Bun.env, ...workspace.env, ...extraEnv },
      stderr: 'pipe',
      stdout: 'pipe',
    },
  );
  return {
    code: result.exitCode,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString(),
  };
};

const runRecord = (
  workspace: Workspace,
  args: ReadonlyArray<string>,
  extraEnv: Record<string, string> = {},
) => run(workspace, recordScript, args, extraEnv);

const runAudit = (workspace: Workspace, args: ReadonlyArray<string>) =>
  run(workspace, auditScript, args);

const readRecording = async (path: string): Promise<RecordedFile> => {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
  return parsed as RecordedFile;
};

const readRequests = async (
  workspace: Workspace,
): Promise<ReadonlyArray<{ cookie: string | null; url: string }>> => {
  if (!existsSync(workspace.requestLog)) return [];
  const text = await readFile(workspace.requestLog, 'utf8');
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as { cookie: string | null; url: string });
};

const writeCookie = async (
  root: string,
  name: string,
  content: string,
): Promise<string> => {
  const path = join(root, name);
  await writeFile(path, content, 'utf8');
  return path;
};

describe('record-fixtures CLI', () => {
  test('aggregates repeated query keys without flattening array values', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'a=[1,2]',
        '--query',
        'a=[3,4]',
        '--query',
        'b=[1,2]',
        '--query',
        'b=3',
        '--query',
        'c=1',
        '--query',
        'c=2',
        '--query',
        'c=3',
        '--query',
        'decimal=1.5',
        '--query',
        'negative=-7',
        '--query',
        'leading=0138',
      ]);

      expect(result.code).toBe(0);
      const recording = await readRecording(
        join(workspace.out, 'batch.default.json'),
      );
      expect(recording.query).toEqual({
        a: [
          [1, 2],
          [3, 4],
        ],
        b: [[1, 2], 3],
        c: [1, 2, 3],
        decimal: '1.5',
        negative: -7,
        leading: '0138',
      });
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('redacts sensitive keys of every value type in query and body', async () => {
    const workspace = await createWorkspace({
      code: 200,
      cookie: { session: 'COOKIE_SESSION_SECRET' },
      tokenJsonStr: 'TOKEN_JSON_SECRET',
      nested: { token: true, tokenVersion: 2, keep: 'nested' },
      csrf: '__csrf=CSRF_SECRET',
      phone: 13800000000,
      email: ['a@b.com'],
      password: 123456,
      passwd: 'PASSWD_SECRET',
      lower: 'music_u=LOWER_SECRET',
      keep: 'ok',
    });
    try {
      const cookie = await writeCookie(
        workspace.root,
        'user.txt',
        'MUSIC_U=INPUT_COOKIE_SECRET',
      );
      const result = runRecord(workspace, [
        'batch',
        '--cookie-file',
        cookie,
        '--out',
        workspace.out,
        '--query',
        'cookie=MUSIC_U=QUERY_COOKIE',
        '--query',
        'password=123456',
        '--query',
        'phone=013800000000',
        '--query',
        'passwd=QUERY_PASSWD',
        '--query',
        'token=true',
        '--query',
        'email=a@b.com',
        '--query',
        'keep=1',
        '--query',
        'empty=',
        '--query',
        'raw=music_a=QUERY_LOWER',
      ]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('警告：已隐去凭据字段：');
      const path = join(workspace.out, 'batch.default.json');
      const text = await readFile(path, 'utf8');
      for (const secret of [
        'COOKIE_SESSION_SECRET',
        'TOKEN_JSON_SECRET',
        'CSRF_SECRET',
        '13800000000',
        'a@b.com',
        'PASSWD_SECRET',
        'LOWER_SECRET',
        'QUERY_LOWER',
        'QUERY_COOKIE',
        'QUERY_PASSWORD',
        'QUERY_PASSWD',
        'INPUT_COOKIE_SECRET',
      ]) {
        expect(text).not.toContain(secret);
        expect(result.stdout).not.toContain(secret);
        expect(result.stderr).not.toContain(secret);
      }

      const recording = JSON.parse(text) as RecordedFile;
      expect(recording.query).toEqual({
        cookie: '<redacted>',
        password: '<redacted>',
        phone: '<redacted>',
        passwd: '<redacted>',
        token: true,
        email: '<redacted>',
        keep: 1,
        empty: '',
        raw: '<redacted>',
      });
      expect(recording.context.redacted).toEqual([
        'query.cookie',
        'query.password',
        'query.phone',
        'query.passwd',
        'query.email',
        'query.raw',
        'body.cookie',
        'body.tokenJsonStr',
        'body.csrf',
        'body.phone',
        'body.email',
        'body.password',
        'body.passwd',
        'body.lower',
      ]);
      expect(recording.response.body).toEqual({
        code: 200,
        cookie: '<redacted>',
        tokenJsonStr: '<redacted>',
        nested: { token: true, tokenVersion: 2, keep: 'nested' },
        csrf: '<redacted>',
        phone: '<redacted>',
        email: '<redacted>',
        password: '<redacted>',
        passwd: '<redacted>',
        lower: '<redacted>',
        keep: 'ok',
      });
      expect(recording.context.viewer).toBe('authenticated');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('preserves null, empty strings, booleans, and empty containers under sensitive keys', async () => {
    const workspace = await createWorkspace({
      code: 200,
      cookie: '',
      tokenJsonStr: null,
      token: true,
      csrf: false,
      email: [],
      password: {},
      passwd: null,
      keep: 'ok',
    });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(result.code).toBe(0);
      const recording = await readRecording(
        join(workspace.out, 'batch.default.json'),
      );
      expect(recording.context.redacted).toBeUndefined();
      expect(recording.response.body).toEqual({
        code: 200,
        cookie: '',
        tokenJsonStr: null,
        token: true,
        csrf: false,
        email: [],
        password: {},
        passwd: null,
        keep: 'ok',
      });
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('self-check blocks a temporarily disabled redaction rule without touching disk', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      { env: { HANA_REDACT_DISABLE: 'password' } },
    );
    try {
      await mkdir(workspace.out, { recursive: true });
      const stale = join(workspace.out, 'batch.default.json');
      await writeFile(stale, '{"stale":true}', 'utf8');

      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'password=123456',
        '--force',
      ]);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('敏感字段没有隐去');
      expect(await readFile(stale, 'utf8')).toBe('{"stale":true}');
      expect(await readdir(workspace.out)).toEqual(['batch.default.json']);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('clears numbered and gzip recordings for the same base only with --force', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      await mkdir(workspace.out, { recursive: true });
      const stale = join(workspace.out, 'batch.default.json');
      await writeFile(stale, '{"stale":true}', 'utf8');
      await writeFile(
        join(workspace.out, 'batch.default.2.json'),
        '{"stale":true}',
        'utf8',
      );
      await writeFile(
        join(workspace.out, 'batch.default.json.gz'),
        gzipSync(JSON.stringify({ stale: true })),
      );
      await writeFile(
        join(workspace.out, 'batch.default.3.json'),
        '{"stale":true}',
        'utf8',
      );
      await writeFile(
        join(workspace.out, 'batch.default.2.json.gz'),
        gzipSync(JSON.stringify({ stale: true })),
      );
      const otherLabel = join(workspace.out, 'batch.rate-limit.json');
      await writeFile(otherLabel, '{"keep":true}', 'utf8');

      const refused = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(refused.code).toBe(1);
      expect(refused.stderr).toContain('--force');
      expect(await readFile(stale, 'utf8')).toBe('{"stale":true}');

      const forced = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--force',
      ]);
      expect(forced.code).toBe(0);
      expect((await readdir(workspace.out)).toSorted()).toEqual([
        'batch.default.json',
        'batch.rate-limit.json',
      ]);
      const recording = await readRecording(stale);
      expect(recording.response.body).toEqual({ code: 200 });
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('rejects cookies without MUSIC_U/MUSIC_A and derives viewer from the identity', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      const missing = await writeCookie(
        workspace.root,
        'missing.txt',
        'os=pc; appver=9.0.0',
      );
      const rejected = runRecord(workspace, [
        'batch',
        '--cookie-file',
        missing,
        '--out',
        workspace.out,
      ]);
      expect(rejected.code).toBe(1);
      expect(rejected.stderr).toContain('MUSIC_U/MUSIC_A');
      expect(existsSync(join(workspace.out, 'batch.default.json'))).toBe(false);

      const anonymousCookie = await writeCookie(
        workspace.root,
        'anonymous.txt',
        'MUSIC_A=anon-token',
      );
      const anonymous = runRecord(workspace, [
        'batch',
        '--cookie-file',
        anonymousCookie,
        '--out',
        workspace.out,
        '--label',
        'anonymous',
      ]);
      expect(anonymous.code).toBe(0);
      const anonymousRecording = await readRecording(
        join(workspace.out, 'batch.anonymous.json'),
      );
      expect(anonymousRecording.context.viewer).toBe('anonymous');

      const userCookie = await writeCookie(
        workspace.root,
        'user.txt',
        'Cookie: music_u=user-token; os=pc',
      );
      const authenticated = runRecord(workspace, [
        'batch',
        '--cookie-file',
        userCookie,
        '--out',
        workspace.out,
        '--label',
        'user',
      ]);
      expect(authenticated.code).toBe(0);
      const userRecording = await readRecording(
        join(workspace.out, 'batch.user.json'),
      );
      expect(userRecording.context.viewer).toBe('authenticated');
      const userRequests = await readRequests(workspace);
      expect(
        userRequests.some((request) =>
          String(request.cookie).includes('MUSIC_U=user-token'),
        ),
      ).toBe(true);
      expect(
        userRequests.some((request) =>
          String(request.cookie).includes('music_u='),
        ),
      ).toBe(false);

      const overridden = runRecord(workspace, [
        'batch',
        '--cookie-file',
        anonymousCookie,
        '--out',
        workspace.out,
        '--label',
        'vip',
        '--viewer',
        'vip',
      ]);
      expect(overridden.code).toBe(0);
      const vipRecording = await readRecording(
        join(workspace.out, 'batch.vip.json'),
      );
      expect(vipRecording.context.viewer).toBe('vip');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('records the register_anonimous module request instead of filtering it', async () => {
    const workspace = await createWorkspace({ code: 200, userId: 1 });
    try {
      const result = runRecord(workspace, [
        'register_anonimous',
        '--anonymous',
        '--out',
        workspace.out,
      ]);

      expect(result.code).toBe(0);
      const files = await readdir(workspace.out);
      expect(files).toEqual(['register_anonimous.default.json']);
      const recording = await readRecording(
        join(workspace.out, 'register_anonimous.default.json'),
      );
      expect(recording.module).toBe('register_anonimous');
      expect(recording.response.body).toEqual({ code: 200, userId: 1 });

      const requests = await readRequests(workspace);
      expect(requests.length).toBe(2);
      expect(
        requests.every((request) =>
          request.url.endsWith('/register/anonimous'),
        ),
      ).toBe(true);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('numbers multi-request recordings and keeps them out of schema audit', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 200, playlist: { trackIds: [{ id: 1 }] } },
          },
          '/v3/song/detail': {
            body: { code: 200, songs: [], privileges: [] },
          },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
      ]);

      expect(result.code).toBe(0);
      expect((await readdir(workspace.out)).toSorted()).toEqual([
        'playlist_track_all.default.1.json',
        'playlist_track_all.default.2.json',
      ]);
      const first = await readRecording(
        join(workspace.out, 'playlist_track_all.default.1.json'),
      );
      const second = await readRecording(
        join(workspace.out, 'playlist_track_all.default.2.json'),
      );
      expect(first.context.part).toEqual({
        index: 1,
        of: 2,
        final: false,
      });
      expect(first.response.body).toEqual({
        code: 200,
        playlist: { trackIds: [{ id: 1 }] },
      });
      expect(second.context.part).toEqual({
        index: 2,
        of: 2,
        final: true,
      });
      expect(second.response.body).toEqual({
        code: 200,
        songs: [],
        privileges: [],
      });

      const audit = runAudit(workspace, ['recordings', workspace.out]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain(
        'recordings: 2 ok entries (1 eligible, 1 multi-part excluded)\n',
      );
      expect(audit.stdout).toContain('  validated: 1\n');
      expect(audit.stdout).toContain('  multi-part: 1 (excluded)\n');
      expect(audit.stdout).toContain('  failures: 0\n');

      const matrix = runAudit(workspace, [
        'module',
        'playlist_track_all',
        '--recordings',
        workspace.out,
      ]);
      expect(matrix.code).toBe(0);
      expect(matrix.stdout).toContain('multi-part: 1 (excluded)\n');
      expect(matrix.stdout).toContain('code\tnumber\t1\t200\n');
      expect(matrix.stdout).toContain('songs\tarray(empty)\t1\t[]\n');
      expect(matrix.stdout).toContain('privileges\tarray(empty)\t1\t[]\n');
      expect(matrix.stdout).not.toContain('playlist.');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('uses --outcome ok to mark the last part final for 803 responses', async () => {
    const workspace = await createWorkspace(
      { code: 803 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 803, playlist: { trackIds: [{ id: 1 }] } },
          },
          '/v3/song/detail': { body: { code: 803 } },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
        '--outcome',
        'ok',
      ]);
      expect(result.code).toBe(1);
      const second = await readRecording(
        join(workspace.out, 'playlist_track_all.default.2.json'),
      );
      expect(second.context.part).toEqual({
        index: 2,
        of: 2,
        final: true,
      });
      expect(second.context.outcome).toBe('ok');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('marks every part non-final when the last attempt returns an error', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 200, playlist: { trackIds: [{ id: 1 }] } },
          },
          '/v3/song/detail': { body: { code: 500 }, status: 500 },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
      ]);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('证据不完整，没有标记 final');
      expect((await readdir(workspace.out)).toSorted()).toEqual([
        'playlist_track_all.default.1.json',
        'playlist_track_all.default.2.json',
      ]);
      const first = await readRecording(
        join(workspace.out, 'playlist_track_all.default.1.json'),
      );
      const second = await readRecording(
        join(workspace.out, 'playlist_track_all.default.2.json'),
      );
      expect(first.context.part).toEqual({
        index: 1,
        of: 2,
        final: false,
      });
      expect(second.context.part).toEqual({
        index: 2,
        of: 2,
        final: false,
      });

      const audit = runAudit(workspace, ['recordings', workspace.out]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain(
        'recordings: 1 ok entries (0 eligible, 1 multi-part excluded)\n',
      );
      expect(audit.stdout).toContain('  multi-part: 2 (excluded)\n');
      expect(audit.stdout).toContain('  validated: 0\n');
      expect(audit.stdout).toContain('  failures: 0\n');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('leaves a slot hole and marks remaining evidence non-final when an attempt throws', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 200, playlist: { trackIds: [{ id: 1 }] } },
          },
          '/v3/song/detail': { error: 'upstream down' },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
      ]);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('证据不完整，没有标记 final');
      expect(await readdir(workspace.out)).toEqual([
        'playlist_track_all.default.1.json',
      ]);
      const only = await readRecording(
        join(workspace.out, 'playlist_track_all.default.1.json'),
      );
      expect(only.context.part).toEqual({
        gaps: [2],
        index: 1,
        of: 2,
        final: false,
      });

      const audit = runAudit(workspace, ['recordings', workspace.out]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain('  multi-part: 1 (excluded)\n');
      expect(audit.stdout).toContain('  validated: 0\n');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('allows a retry gap and keeps the final part when the last attempt succeeds', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 200, playlist: { trackIds: [{ id: 1 }] } },
            error: 'connect ECONNREFUSED 127.0.0.1:443',
            errorOnce: true,
          },
          '/v3/song/detail': {
            body: { code: 200, songs: [], privileges: [] },
          },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
      ]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('第 1 次尝试没有响应，已忽略');
      expect(result.stdout).not.toContain('证据不完整');
      expect((await readdir(workspace.out)).toSorted()).toEqual([
        'playlist_track_all.default.2.json',
        'playlist_track_all.default.3.json',
      ]);
      const first = await readRecording(
        join(workspace.out, 'playlist_track_all.default.2.json'),
      );
      const second = await readRecording(
        join(workspace.out, 'playlist_track_all.default.3.json'),
      );
      expect(first.context.part).toEqual({
        gaps: [1],
        index: 2,
        of: 3,
        final: false,
      });
      expect(second.context.part).toEqual({
        gaps: [1],
        index: 3,
        of: 3,
        final: true,
      });

      const audit = runAudit(workspace, ['recordings', workspace.out]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain(
        'recordings: 2 ok entries (1 eligible, 1 multi-part excluded)\n',
      );
      expect(audit.stdout).toContain('  validated: 1\n');
      expect(audit.stdout).toContain('  multi-part: 1 (excluded)\n');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('keeps the last part final when the module fails after all responses arrive', async () => {
    const workspace = await createWorkspace(
      { code: 200 },
      {
        routes: {
          '/v6/playlist/detail': {
            body: { code: 200, playlist: { trackIds: [{ id: 1 }] } },
          },
          '/v3/song/detail': { body: { code: 200, songs: 'bad' } },
        },
      },
    );
    try {
      const result = runRecord(workspace, [
        'playlist_track_all',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'id=123',
      ]);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('模块调用以失败结束');
      expect(result.stdout).not.toContain('证据不完整');
      const second = await readRecording(
        join(workspace.out, 'playlist_track_all.default.2.json'),
      );
      expect(second.context.part).toEqual({
        index: 2,
        of: 2,
        final: true,
      });
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('treats shell { body: { code: 200 } } responses as successful', async () => {
    const workspace = await createWorkspace({
      body: { code: 200 },
      status: 200,
    });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('body.code: 200');
      expect(result.stdout).not.toContain('不是正常返回');
      const recording = await readRecording(
        join(workspace.out, 'batch.default.json'),
      );
      expect(recording.response.body).toEqual({
        body: { code: 200 },
        status: 200,
      });
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('writes --outcome into context and lets audit classify the recording', async () => {
    const workspace = await createWorkspace({ code: 803, message: 'ok' });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--outcome',
        'ok',
      ]);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('不是正常返回');

      const recording = await readRecording(
        join(workspace.out, 'batch.default.json'),
      );
      expect(recording.context.outcome).toBe('ok');

      const audit = runAudit(workspace, [
        'module',
        'batch',
        '--recordings',
        workspace.out,
      ]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain('module: batch\nrecordings: 1\n  ok: 1\n');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('saves non-normal status and code recordings and exits 1', async () => {
    const codeWorkspace = await createWorkspace({ code: 300 });
    const statusWorkspace = await createWorkspace(
      { code: 200 },
      { status: 500 },
    );
    try {
      const cookie = await writeCookie(
        codeWorkspace.root,
        'serverless.txt',
        'MUSIC_A=anon-token',
      );
      const codeResult = runRecord(codeWorkspace, [
        'batch',
        '--cookie-file',
        cookie,
        '--out',
        codeWorkspace.out,
      ]);
      expect(codeResult.code).toBe(1);
      expect(codeResult.stdout).toContain('不是正常返回');
      expect(codeResult.stdout).toContain('code 300');
      const codeRecording = await readRecording(
        join(codeWorkspace.out, 'batch.default.json'),
      );
      expect(codeRecording.response.body).toEqual({ code: 300 });

      const statusCookie = await writeCookie(
        statusWorkspace.root,
        'serverless.txt',
        'MUSIC_A=anon-token',
      );
      const statusResult = runRecord(statusWorkspace, [
        'batch',
        '--cookie-file',
        statusCookie,
        '--out',
        statusWorkspace.out,
      ]);
      expect(statusResult.code).toBe(1);
      expect(statusResult.stdout).toContain('status 500');
      const statusRecording = await readRecording(
        join(statusWorkspace.out, 'batch.default.json'),
      );
      expect(statusRecording.response.status).toBe(500);
    } finally {
      await rm(codeWorkspace.root, { force: true, recursive: true });
      await rm(statusWorkspace.root, { force: true, recursive: true });
    }
  });

  test('warns and saves responses without a top-level code while audit treats them as ok', async () => {
    const workspace = await createWorkspace({ items: [], ok: true });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('不是正常返回');
      expect(result.stdout).toContain('code undefined');
      const recording = await readRecording(
        join(workspace.out, 'batch.default.json'),
      );
      expect(recording.response.body).toEqual({ items: [], ok: true });

      const audit = runAudit(workspace, [
        'module',
        'batch',
        '--recordings',
        workspace.out,
      ]);
      expect(audit.code).toBe(0);
      expect(audit.stdout).toContain('recordings: 1\n  ok: 1\n');
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('reports modules that produce no upstream request', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      const result = runRecord(workspace, [
        'login_qr_check',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('没有产生任何上游请求');
      expect(existsSync(workspace.out)).toBe(false);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('prints a readable anonymous prefetch failure', async () => {
    const workspace = await createWorkspace({ code: 500 }, { status: 500 });
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
      ]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('匿名令牌预取失败');
      expect(result.stderr).not.toContain('[object Object]');
      expect(existsSync(workspace.out)).toBe(false);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('rejects empty or relative HANA_TEST_FIXTURES_ROOT values', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      for (const value of ['', 'relative/fixtures']) {
        const result = runRecord(
          workspace,
          ['batch', '--anonymous', '--dir', 'some-domain'],
          { HANA_TEST_FIXTURES_ROOT: value },
        );
        expect(result.code).toBe(1);
        expect(result.stderr).toContain(
          'HANA_TEST_FIXTURES_ROOT 必须是非空绝对路径',
        );
      }
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('does not echo query values in parse errors', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      const badJson = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'password={"bad-secret',
      ]);
      expect(badJson.code).toBe(1);
      expect(badJson.stderr).toContain('--query password 的值不是合法 JSON');
      expect(badJson.stderr).not.toContain('bad-secret');

      const badPair = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--query',
        'hunter2',
      ]);
      expect(badPair.code).toBe(1);
      expect(badPair.stderr).toContain('需要 k=v 形式');
      expect(badPair.stderr).not.toContain('hunter2');
      expect(existsSync(join(workspace.out, 'batch.default.json'))).toBe(false);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('rejects empty, dot, escaping, absolute, and numbered --dir/label values', async () => {
    const workspace = await createWorkspace({ code: 200 });
    try {
      const cases = ['', '.', '../escape', join(workspace.root, 'absolute')];
      for (const dir of cases) {
        const result = runRecord(workspace, [
          'batch',
          '--anonymous',
          '--dir',
          dir,
        ]);
        expect(result.code).toBe(1);
        expect(result.stderr).toContain('--dir');
      }
      const numberedLabel = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--out',
        workspace.out,
        '--label',
        'take.2',
      ]);
      expect(numberedLabel.code).toBe(1);
      expect(numberedLabel.stderr).toContain('.数字');
      expect(
        existsSync(join(repoRoot, 'tests/fixtures/netease/batch.default.json')),
      ).toBe(false);
    } finally {
      await rm(workspace.root, { force: true, recursive: true });
    }
  });

  test('writes a successful --dir recording under the fixtures root', async () => {
    const workspace = await createWorkspace({ code: 200 });
    const dir = `hana-cli-${randomUUID()}`;
    const target = join(workspace.root, 'fixtures', dir);
    try {
      const result = runRecord(workspace, [
        'batch',
        '--anonymous',
        '--dir',
        dir,
      ]);
      expect(result.code).toBe(0);
      const recording = await readRecording(join(target, 'batch.default.json'));
      expect(recording.module).toBe('batch');
      expect(recording.response.body).toEqual({ code: 200 });
    } finally {
      await rm(target, { force: true, recursive: true });
      await rm(workspace.root, { force: true, recursive: true });
    }
  });
});
