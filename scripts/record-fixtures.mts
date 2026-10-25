#!/usr/bin/env bun

/**
 * 录制 CLI：用真实上游返回生成 tests/fixtures/netease 录制。
 *
 * 用法：
 *   bun run fixtures:record <module> --dir <领域> [--label <label>] [--query k=v]... \
 *     [--cookie-file <path> | --anonymous] [--region <text>] [--viewer <text>] \
 *     [--outcome <text>] [--note <text>] [--force]
 *   bun run fixtures:record <module> --out <绝对目录> [...]
 *
 * 录制在 fetcher 层截取网易云返回，除 `context.redacted` 记录的字段外保留原文；
 * Cookie 只从本机未跟踪文件读取，不打印；敏感 query/body 字段写盘前替换成 <redacted>。
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { isAbsolute, join, resolve, sep } from 'node:path';

import { ensureRuntimeAnonymousToken } from '../src/core/anonymous.ts';
import { buildCallServices, runCall } from '../src/core/call.ts';
import { isRecord } from '../src/core/utils.ts';
import { sdkModuleRegistry } from '../src/sdk/generated/registry.generated.ts';
import type {
  FetchLike,
  ModuleCallConfig,
  ModuleDefinition,
  ModuleIdentifier,
  ModuleQuery,
} from '../src/types/index.ts';

const scriptDir = import.meta.dir;
const repoRoot = resolve(scriptDir, '..');
const modulesDir = join(repoRoot, 'src/modules');
// HANA_TEST_FIXTURES_ROOT 只给测试隔离用，不在 help 里宣传；必须是非空绝对路径。
const testFixturesRoot = process.env.HANA_TEST_FIXTURES_ROOT;
if (
  testFixturesRoot !== undefined &&
  (testFixturesRoot.trim() === '' || !isAbsolute(testFixturesRoot))
) {
  throw new Error('HANA_TEST_FIXTURES_ROOT 必须是非空绝对路径');
}
const fixturesRoot =
  testFixturesRoot === undefined
    ? join(repoRoot, 'tests/fixtures/netease')
    : resolve(testFixturesRoot);

const out = (message: string) => process.stdout.write(`${message}\n`);

type Capture = {
  readonly status: number;
  readonly body: unknown;
  readonly bytes: number;
};

type RecordOptions = {
  readonly moduleName: string;
  readonly dir: string | undefined;
  readonly outDir: string | undefined;
  readonly label: string;
  readonly query: Record<string, unknown>;
  readonly cookieFile: string | undefined;
  readonly anonymous: boolean;
  readonly region: string;
  readonly note: string | undefined;
  readonly viewer: string | undefined;
  readonly outcome: string | undefined;
  readonly force: boolean;
};

type CookieIdentity = {
  readonly header: string;
  readonly hasUser: boolean;
};

const help = () => {
  out(`fixtures:record <module> [options]

options:
  --dir <领域>           写入 tests/fixtures/netease/<领域>/
  --out <绝对目录>       写入指定目录（探测用，不污染仓库）
  --label <label>        录制标签，默认 default；不能以 .数字 结尾
  --query k=v            查询参数，可重复；重复 key 聚合成数组
                         类型：true/false、整数、以 [ / { / " 开头的 JSON；
                         其他（含小数和带前导零的号码）按字符串
                         前导零号码：--query 'phone="0138..."'
  --cookie-file <path>   读取本机 Cookie（原始头或 JSON 对象）
  --anonymous            不读取本机 Cookie（SDK 仍可能携带匿名令牌）
  --region <text>        context.region，默认 local
  --note <text>          context.note
  --viewer <text>        context.viewer；默认 MUSIC_U → authenticated，仅 MUSIC_A → anonymous
  --outcome <text>       写入 context.outcome；审计优先按它判 ok/非 ok
  --force                覆盖已存在的录制

退出码：
  0  正常返回
  1  调用失败，或保存了非正常返回（status ≠ 200 / 顶层 code ≠ 200）
     没有顶层 code 的响应（如插件上传阶段）也在此列，会告警并 exit 1；
     审计仍按 ok 处理，用于提示人工确认`);
};

const takeValue = (
  argv: ReadonlyArray<string>,
  index: number,
  flag: string,
): string => {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${flag} 需要一个值`);
  }
  return value;
};

const parseQueryValue = (raw: string, key: string): unknown => {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  // 只把无前导零的整数当数字；小数、前导零号码保持字符串，避免丢精度或丢前导零。
  if (/^-?(?:0|[1-9]\d*)$/.test(raw)) return Number(raw);
  if (raw.startsWith('[') || raw.startsWith('{') || raw.startsWith('"')) {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      throw new Error(`--query ${key} 的值不是合法 JSON`);
    }
  }
  return raw;
};

/**
 * 第一次出现直接写值；第二次把首值和当前值包成 `[first, value]`；
 * 之后 push 到同一个聚合数组。用 Map 记住聚合数组，首值本来就是数组时也不会误 push。
 */
const appendQuery = (
  query: Record<string, unknown>,
  aggregated: Map<string, Array<unknown>>,
  key: string,
  value: unknown,
) => {
  const values = aggregated.get(key);
  if (values) {
    values.push(value);
    return;
  }
  if (!Object.hasOwn(query, key)) {
    query[key] = value;
    return;
  }
  const pair = [query[key], value];
  query[key] = pair;
  aggregated.set(key, pair);
};

const assertContextToken = (flag: string, value: string | undefined) => {
  if (
    value !== undefined &&
    (value.trim() === '' || !/^[A-Za-z0-9._-]+$/.test(value))
  ) {
    throw new Error(`${flag} 只能包含字母、数字、点、下划线和连字符：${value}`);
  }
};

const parseArgs = (argv: ReadonlyArray<string>): RecordOptions => {
  let moduleName: string | undefined;
  let dir: string | undefined;
  let outDir: string | undefined;
  let label = 'default';
  let cookieFile: string | undefined;
  let anonymous = false;
  let region = 'local';
  let note: string | undefined;
  let viewer: string | undefined;
  let outcome: string | undefined;
  let force = false;
  const query: Record<string, unknown> = {};
  const aggregatedQueryKeys = new Map<string, Array<unknown>>();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? '';
    switch (arg) {
      case '--dir':
        dir = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--out':
        outDir = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--label':
        label = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--query': {
        const pair = takeValue(argv, index, arg);
        const separator = pair.indexOf('=');
        if (separator <= 0) {
          throw new Error(`--query 第 ${index + 1} 个参数需要 k=v 形式`);
        }
        const key = pair.slice(0, separator);
        appendQuery(
          query,
          aggregatedQueryKeys,
          key,
          parseQueryValue(pair.slice(separator + 1), key),
        );
        index += 1;
        break;
      }
      case '--cookie-file':
        cookieFile = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--anonymous':
        anonymous = true;
        break;
      case '--region':
        region = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--note':
        note = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--viewer':
        viewer = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--outcome':
        outcome = takeValue(argv, index, arg);
        index += 1;
        break;
      case '--force':
        force = true;
        break;
      case '--help':
      case '-h':
        help();
        process.exit(0);
      default:
        if (arg.startsWith('--')) {
          throw new Error(`未知参数：${arg}`);
        }
        if (moduleName !== undefined) {
          throw new Error(`只能录一个模块，多余参数：${arg}`);
        }
        moduleName = arg;
    }
  }

  if (!moduleName) {
    throw new Error(
      '需要模块名，例如：bun run fixtures:record toplist --dir toplist --anonymous',
    );
  }
  if (!/^[A-Za-z0-9_]+$/.test(moduleName)) {
    throw new Error(`模块名不合法：${moduleName}`);
  }
  if (!existsSync(join(modulesDir, `${moduleName}.ts`))) {
    throw new Error(`找不到模块 src/modules/${moduleName}.ts`);
  }
  if (!label || !/^[A-Za-z0-9._-]+$/.test(label)) {
    throw new Error(`--label 只能包含字母、数字、点、下划线和连字符：${label}`);
  }
  if (/\.[0-9]+$/.test(label)) {
    throw new Error(
      `--label 不能以 .数字 结尾，会和编号录制文件撞名：${label}`,
    );
  }
  if ((dir === undefined) === (outDir === undefined)) {
    throw new Error('--dir 和 --out 必须给且只给一个');
  }
  if ((cookieFile === undefined) === !anonymous) {
    throw new Error('--cookie-file 和 --anonymous 必须给且只给一个');
  }
  if (outDir !== undefined && !isAbsolute(outDir)) {
    throw new Error(`--out 需要绝对路径：${outDir}`);
  }
  assertContextToken('--viewer', viewer);
  assertContextToken('--outcome', outcome);

  return {
    moduleName,
    dir,
    outDir,
    label,
    query,
    cookieFile,
    anonymous,
    region,
    note,
    viewer,
    outcome,
    force,
  };
};

const resolveOutDir = (options: RecordOptions): string => {
  if (options.outDir) return options.outDir;
  const dir = (options.dir ?? '').trim();
  if (dir === '') {
    throw new Error(
      '--dir 不能为空；录制要落在 tests/fixtures/netease 的子目录',
    );
  }
  if (isAbsolute(dir)) {
    throw new Error(`--dir 需要相对路径：${dir}`);
  }
  const target = resolve(fixturesRoot, dir);
  if (!target.startsWith(`${fixturesRoot}${sep}`)) {
    throw new Error(`--dir 必须是 ${fixturesRoot} 下的子目录：${dir}`);
  }
  return target;
};

const missingCookieIdentity =
  'Cookie 里没有 MUSIC_U/MUSIC_A 身份，不能作为登录视角的证据';

const hasIdentityCookie = (pairs: ReadonlyArray<readonly [string, string]>) =>
  pairs.some(
    ([key, value]) =>
      value.trim() !== '' && (key === 'MUSIC_U' || key === 'MUSIC_A'),
  );

/** identity 层只认精确 key；Cookie 文件里的大小写写法统一成 MUSIC_U/MUSIC_A。 */
const canonicalCookieKey = (key: string): string => {
  const lower = key.toLowerCase();
  if (lower === 'music_u') return 'MUSIC_U';
  if (lower === 'music_a') return 'MUSIC_A';
  return key;
};

const readCookie = (file: string): CookieIdentity => {
  const path = isAbsolute(file) ? file : resolve(repoRoot, file);
  if (!existsSync(path)) {
    throw new Error(`找不到 Cookie 文件：${file}`);
  }
  const raw = readFileSync(path, 'utf8')
    .trim()
    .replace(/^cookie\s*:\s*/i, '');
  if (!raw) {
    throw new Error(`Cookie 文件是空的：${file}`);
  }
  let pairs: Array<readonly [string, string]>;
  if (raw.startsWith('{')) {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      throw new Error('Cookie 文件的 JSON 不是对象');
    }
    pairs = Object.entries(parsed).flatMap(([key, value]) =>
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
        ? [[canonicalCookieKey(key), String(value)] as const]
        : [],
    );
    if (pairs.length === 0) {
      throw new Error('Cookie 文件的 JSON 没有可用字段');
    }
  } else {
    pairs = raw.split(';').map((part) => {
      const separator = part.indexOf('=');
      return separator < 0
        ? ([canonicalCookieKey(part.trim()), ''] as const)
        : ([
            canonicalCookieKey(part.slice(0, separator).trim()),
            part.slice(separator + 1).trim(),
          ] as const);
    });
  }
  if (!hasIdentityCookie(pairs)) {
    throw new Error(missingCookieIdentity);
  }
  return {
    header: pairs.map(([key, value]) => `${key}=${value}`).join('; '),
    hasUser: pairs.some(
      ([key, value]) => key === 'MUSIC_U' && value.trim() !== '',
    ),
  };
};

const packageVersion = () => {
  const parsed = JSON.parse(
    readFileSync(join(repoRoot, 'package.json'), 'utf8'),
  ) as { readonly version?: unknown };
  if (typeof parsed.version !== 'string') {
    throw new Error('package.json 没有 version');
  }
  return parsed.version;
};

const codeOf = (body: unknown) =>
  isRecord(body) && 'code' in body ? body.code : undefined;

/**
 * 与 scripts/schema-audit.mts 的 bodyFromRecording 同规则：外壳响应 `{ body, status }`
 * 且外层没有 code 时，成功判定看内层 body.code。
 */
const unwrappedBody = (body: unknown): unknown =>
  isRecord(body) && !('code' in body) && isRecord(body.body) ? body.body : body;

const messageOf = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const message = body.msg ?? body.message;
  return typeof message === 'string' ? message : undefined;
};

const failureReason = (failure: unknown): string | undefined => {
  if (failure === undefined) return undefined;
  const body =
    isRecord(failure) && 'body' in failure ? failure.body : undefined;
  const message = messageOf(body);
  if (message !== undefined) return message;
  if (failure instanceof Error) return failure.message;
  return typeof failure === 'string' ? failure : '上游调用失败';
};

/** SDK 内部匿名注册请求不是模块证据；按路径跳过，也不占录制编号。 */
const internalRequestPaths = ['/register/anonimous'] as const;

/**
 * 被调用模块本身就是 register_anonimous 时，同一路径是模块证据，不能过滤；
 * CLI 自己的匿名令牌预取不经过 capture fetcher，本来就不在录制里。
 */
const isInternalRequest = (
  input: Request | URL | string,
  moduleName: string,
) => {
  if (moduleName === 'register_anonimous') return false;
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  try {
    const { pathname } = new URL(url);
    return internalRequestPaths.some((path) => pathname.endsWith(path));
  } catch {
    return false;
  }
};

/** fetcher 先克隆响应读原文，原响应仍交给 SDK；按发起顺序占位，避免并发打乱编号。 */
const createCaptureFetcher = (
  captures: Array<Capture | undefined>,
  warnings: Array<string>,
  moduleName: string,
): {
  readonly fetcher: FetchLike;
  readonly attempts: () => number;
} => {
  let nextIndex = 0;
  return {
    attempts: () => nextIndex,
    fetcher: async (input, init) => {
      const internal = isInternalRequest(input, moduleName);
      const slot = internal ? -1 : nextIndex;
      if (!internal) nextIndex += 1;
      const response = await fetch(input, init);
      if (slot < 0) return response;
      const text = await response.clone().text();
      let body: unknown = text;
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        warnings.push(`上游返回不是 JSON（${response.status}），按原文记录`);
      }
      captures[slot] = {
        status: response.status,
        body,
        bytes: Buffer.byteLength(text, 'utf8'),
      };
      return response;
    },
  };
};

const redactedValue = '<redacted>';
const credentialKeyFragments = [
  'music_u',
  'music_a',
  'cookie',
  'token',
  'csrf',
  'password',
  'passwd',
  'secret',
  'captcha',
  'phone',
  'email',
] as const;
// tokenVersion 是数字版本号，不是凭据；只有精确等于这个名字才豁免。
const credentialKeyExceptions = new Set(['tokenVersion']);
const isCredentialKey = (key: string) => {
  if (credentialKeyExceptions.has(key)) return false;
  const lower = key.toLowerCase();
  return credentialKeyFragments.some((fragment) => lower.includes(fragment));
};
const credentialValue = /MUSIC_[UA]=|__csrf=/i;

/** 敏感 key 只整值替换非空字符串、数字和非空容器；null/空串/布尔/空容器保留类型证据。 */
const needsCredentialRedaction = (value: unknown): boolean => {
  if (typeof value === 'string') return value !== '';
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return false;
};

// 仅供测试：HANA_REDACT_DISABLE 按 key 片段临时关闭 redaction，结构化自检仍会兜底。
const disabledRedactionFragments = new Set(
  (process.env.HANA_REDACT_DISABLE ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value !== ''),
);
const shouldRedactKey = (key: string) =>
  isCredentialKey(key) &&
  ![...disabledRedactionFragments].some((fragment) =>
    key.toLowerCase().includes(fragment),
  );

/**
 * 敏感 key 在任意深度命中，整个值（字符串/数字/布尔/对象/数组）都替换成 <redacted>，
 * 父节点敏感时不再深入；其他节点继续递归。path 相对录制文件（query.* / body.*）。
 */
const redact = (
  value: unknown,
  path: string,
  redactedPaths: Array<string>,
): unknown => {
  if (isRecord(value)) {
    const redacted: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      if (shouldRedactKey(key) && needsCredentialRedaction(item)) {
        redactedPaths.push(childPath);
        redacted[key] = redactedValue;
        continue;
      }
      redacted[key] = redact(item, childPath, redactedPaths);
    }
    return redacted;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      redact(item, `${path}[${index}]`, redactedPaths),
    );
  }
  if (typeof value === 'string' && credentialValue.test(value)) {
    redactedPaths.push(path);
    return redactedValue;
  }
  return value;
};

/**
 * 写盘自检：对最终对象结构化递归，敏感 key 只能等于 <redacted>，任何字符串不能含
 * MUSIC_U=/MUSIC_A=/__csrf=。失败时调用方尚未动磁盘，因此不写新文件也不删旧录制。
 */
const assertNoLeaks = (value: unknown, path: string): void => {
  if (typeof value === 'string') {
    if (credentialValue.test(value)) {
      throw new Error(`录制 ${path} 仍含未隐去的凭据，已停止写盘`);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      assertNoLeaks(item, `${path}[${index}]`);
    }
    return;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (
        isCredentialKey(key) &&
        item !== redactedValue &&
        item !== null &&
        item !== '' &&
        typeof item !== 'boolean' &&
        !(Array.isArray(item) && item.length === 0) &&
        !(isRecord(item) && Object.keys(item).length === 0)
      ) {
        throw new Error(`录制 ${path}.${key} 的敏感字段没有隐去，已停止写盘`);
      }
      assertNoLeaks(item, path.length === 0 ? key : `${path}.${key}`);
    }
  }
};

type RecordingPart = {
  readonly index: number;
  readonly of: number;
  readonly final: boolean;
  readonly gaps?: ReadonlyArray<number>;
};

type Writing = {
  readonly path: string;
  readonly text: string;
};

type RecordingInput = {
  readonly options: RecordOptions;
  readonly capture: Capture;
  readonly viewer: string;
  readonly sdkVersion: string;
  readonly query: unknown;
  readonly body: unknown;
  readonly redactedPaths: ReadonlyArray<string>;
  readonly part: RecordingPart | undefined;
};

const recordingOf = ({
  options,
  capture,
  viewer,
  sdkVersion,
  query,
  body,
  redactedPaths,
  part,
}: RecordingInput) => ({
  module: options.moduleName,
  query,
  context: {
    recordedAt: new Date().toISOString(),
    sdk: `hana-music-api@${sdkVersion}`,
    region: options.region,
    viewer,
    ...(options.note === undefined ? {} : { note: options.note }),
    ...(options.outcome === undefined ? {} : { outcome: options.outcome }),
    ...(part === undefined ? {} : { part }),
    ...(redactedPaths.length === 0 ? {} : { redacted: redactedPaths }),
  },
  response: {
    status: capture.status,
    body,
  },
});

/** 只有一次尝试用 `<base>.json`；多请求按尝试序号写 `<base>.<n>.json`（n 从 1 开始）。 */
const targetPath = (
  outDir: string,
  moduleName: string,
  label: string,
  index: number,
  attempts: number,
) => {
  const base = join(outDir, `${moduleName}.${label}`);
  return attempts === 1 ? `${base}.json` : `${base}.${index}.json`;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 只认 `<base>.json`、`<base>.<数字>.json` 及其 `.json.gz` 形态，
 * 避免误删 `rate-limit` 等标签文件。gz 是历史手工压缩，但同 base 的新旧证据不能并存。
 */
const existingRecordings = (outDir: string, baseName: string) => {
  if (!existsSync(outDir)) return [];
  const recording = new RegExp(
    `^${escapeRegExp(baseName)}(?:\\.\\d+)?\\.json(?:\\.gz)?$`,
  );
  return readdirSync(outDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && recording.test(entry.name))
    .map((entry) => join(outDir, entry.name));
};

const assertCanOverwrite = (
  existing: ReadonlyArray<string>,
  force: boolean,
) => {
  if (existing.length > 0 && !force) {
    throw new Error(
      `录制已存在，确认要覆盖时加 --force：\n${existing.join('\n')}`,
    );
  }
};

const clearExisting = (outDir: string, baseName: string, force: boolean) => {
  // 删除前再确认一次，避免预检之后出现的新文件被静默清掉。
  const existing = existingRecordings(outDir, baseName);
  assertCanOverwrite(existing, force);
  for (const path of existing) rmSync(path);
};

/** 录制必须通过 fmt:check；JSON 的短数组换行由 Oxfmt 决定，写完统一格式化。 */
const formatWritten = (paths: ReadonlyArray<string>) => {
  const formatter = join(
    repoRoot,
    'node_modules/.bin',
    process.platform === 'win32' ? 'oxfmt.cmd' : 'oxfmt',
  );
  if (!existsSync(formatter)) {
    throw new Error('找不到 node_modules/.bin/oxfmt，先运行 bun install');
  }
  const result = Bun.spawnSync([formatter, ...paths], {
    cwd: repoRoot,
    stderr: 'pipe',
    stdout: 'ignore',
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `录制已写入但格式化失败，运行 bun run fmt 修正：${result.stderr.toString()}`,
    );
  }
};

type PlanInput = {
  readonly options: RecordOptions;
  readonly outDir: string;
  readonly recorded: ReadonlyArray<{
    readonly index: number;
    readonly capture: Capture;
  }>;
  readonly attempts: number;
  readonly viewer: string;
  readonly sdkVersion: string;
  readonly partOf: (index: number) => RecordingPart | undefined;
  readonly warnings: Array<string>;
};

/** 构建待写文件并做泄漏自检；此步骤不触碰磁盘，失败时旧录制保持原样。 */
const planWritings = ({
  options,
  outDir,
  recorded,
  attempts,
  viewer,
  sdkVersion,
  partOf,
  warnings,
}: PlanInput) => {
  const lines: Array<string> = [];
  const redactedPaths = new Set<string>();
  const writings: Array<Writing> = [];

  const queryRedactedPaths: Array<string> = [];
  const redactedQuery = redact(options.query, 'query', queryRedactedPaths);
  for (const redactedPath of queryRedactedPaths) {
    redactedPaths.add(redactedPath);
  }

  for (const { index, capture } of recorded) {
    const path = targetPath(
      outDir,
      options.moduleName,
      options.label,
      index,
      attempts,
    );
    const captureRedacted: Array<string> = [...queryRedactedPaths];
    const body = redact(capture.body, 'body', captureRedacted);
    for (const redactedPath of captureRedacted) {
      redactedPaths.add(redactedPath);
    }
    const recording = recordingOf({
      options,
      capture,
      viewer,
      sdkVersion,
      query: redactedQuery,
      body,
      redactedPaths: captureRedacted,
      part: partOf(index),
    });
    assertNoLeaks(recording, '');
    writings.push({
      path,
      text: `${JSON.stringify(recording, null, 2)}\n`,
    });
    const code = codeOf(unwrappedBody(capture.body));
    lines.push(
      path,
      `  status: ${capture.status}`,
      `  body.code: ${String(code)}`,
      `  bytes: ${capture.bytes}`,
    );
    if (capture.status !== 200 || code !== 200) {
      warnings.push(
        `${path} 不是正常返回（status ${capture.status}，code ${String(code)}），已保存供错误路径使用`,
      );
    }
  }

  return { lines, redactedPaths: [...redactedPaths], writings };
};

/** 所有文件通过自检后才清旧、写盘并格式化。 */
const commitWritings = (
  outDir: string,
  baseName: string,
  force: boolean,
  writings: ReadonlyArray<Writing>,
) => {
  mkdirSync(outDir, { recursive: true });
  clearExisting(outDir, baseName, force);
  for (const { path, text } of writings) writeFileSync(path, text);
  formatWritten(writings.map(({ path }) => path));
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const outDir = resolveOutDir(options);
  const identity =
    options.cookieFile === undefined
      ? undefined
      : readCookie(options.cookieFile);
  const cookie = identity?.header;

  const baseName = `${options.moduleName}.${options.label}`;
  // 网络前快速失败：已有录制且没给 --force 时不发请求；删除前 clearExisting 会再查一次。
  assertCanOverwrite(existingRecordings(outDir, baseName), options.force);

  const captures: Array<Capture | undefined> = [];
  const warnings: Array<string> = [];
  const notes: Array<string> = [];
  const captureState = createCaptureFetcher(
    captures,
    warnings,
    options.moduleName,
  );
  const { fetcher } = captureState;

  const config: ModuleCallConfig = {
    fetcher,
    retry: { retries: 0 },
  };
  const withCookie: ModuleCallConfig =
    cookie === undefined ? config : { ...config, cookie };

  // 匿名模式先拿 SDK 匿名令牌，注册请求本身不作为模块证据记录。
  let anonymousToken: string | undefined;
  if (cookie === undefined) {
    try {
      anonymousToken = await ensureRuntimeAnonymousToken({
        retry: { retries: 0 },
      });
    } catch (error: unknown) {
      throw new Error(
        `匿名令牌预取失败：${failureReason(error) ?? '上游调用失败'}`,
        { cause: error },
      );
    }
  }

  const implementation = sdkModuleRegistry[
    options.moduleName as ModuleIdentifier
  ] as unknown as ModuleDefinition<string, ModuleQuery> | undefined;
  if (!implementation) {
    throw new Error(
      `模块 ${options.moduleName} 不在生成的 registry 里，先运行 bun run types:modules:generate`,
    );
  }
  // 关闭业务重试；首次连接失败仍可能按连接层策略重试，失败尝试没有响应、不会进录制。
  // 服务层使用 ttl 为 null 的 ReadStore，缓存实际关闭，重复调用不会命中缓存而漏录。
  const services = buildCallServices({ cache: { enabled: false } }, false);

  let failure: unknown;
  try {
    await runCall(
      {
        identifier: options.moduleName,
        input: options.query,
        config: {
          ...withCookie,
          ...(anonymousToken === undefined
            ? {}
            : { state: { anonymousToken } }),
        },
      },
      services,
      implementation,
    );
  } catch (error: unknown) {
    failure = error;
  }

  const attempts = captureState.attempts();
  const recorded = captures.flatMap((capture, slot) =>
    capture === undefined ? [] : [{ index: slot + 1, capture }],
  );
  if (recorded.length === 0) {
    const reason = failureReason(failure);
    const lead =
      attempts === 0
        ? '这次调用没有产生任何上游请求'
        : `上游请求尝试 ${attempts} 次都没有返回可记录响应`;
    throw new Error(
      `${lead}${reason === undefined ? '' : `（${reason}）`}，没有可记录的返回；确认模块参数和网络。`,
    );
  }

  // of 是尝试次数（含失败）；中间尝试没有响应允许，记 gaps；最后一份正常才标记 final。
  const gaps = Array.from(
    { length: attempts },
    (_, offset) => offset + 1,
  ).filter((index) => captures[index - 1] === undefined);
  const finalAttempt = recorded.find(({ index }) => index === attempts);
  const lastAttemptNormal =
    finalAttempt !== undefined &&
    (options.outcome === undefined
      ? finalAttempt.capture.status === 200 &&
        codeOf(unwrappedBody(finalAttempt.capture.body)) === 200
      : options.outcome === 'ok');
  const incomplete = attempts > 1 && !lastAttemptNormal;
  if (incomplete) {
    warnings.push(
      `${baseName} 证据不完整，没有标记 final（尝试 ${attempts} 次，记录 ${recorded.length} 份）`,
    );
  }
  for (const index of gaps) {
    notes.push(`第 ${index} 次尝试没有响应，已忽略`);
  }
  const partOf = (index: number) =>
    attempts <= 1
      ? undefined
      : {
          index,
          of: attempts,
          final: lastAttemptNormal && index === attempts,
          ...(gaps.length === 0 ? {} : { gaps }),
        };

  const sdkVersion = packageVersion();
  const viewer =
    options.viewer ??
    (identity?.hasUser === true ? 'authenticated' : 'anonymous');

  const { lines, redactedPaths, writings } = planWritings({
    options,
    outDir,
    recorded,
    attempts,
    viewer,
    sdkVersion,
    partOf,
    warnings,
  });

  commitWritings(outDir, baseName, options.force, writings);
  out(lines.join('\n'));
  for (const warning of warnings) out(`警告：${warning}`);
  for (const note of notes) out(`警告：${note}`);
  if (redactedPaths.length > 0) {
    out(`警告：已隐去凭据字段：${redactedPaths.join('、')}`);
  }

  if (failure !== undefined) {
    const status =
      isRecord(failure) && typeof failure.status === 'number'
        ? failure.status
        : undefined;
    const reason = failureReason(failure) ?? '上游调用失败';
    out(
      `警告：模块调用以失败结束（status ${status === undefined ? 'unknown' : String(status)}）：${reason}`,
    );
  }
  if (warnings.length > 0 || failure !== undefined) {
    process.exitCode = 1;
  }
};

try {
  await main();
} catch (error: unknown) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
