import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import { sdkModuleRegistry } from '../src/sdk/generated/registry.generated.ts';

const ROOT = resolve(import.meta.dir, '..');
const MODULES_DIRECTORY = join(ROOT, 'src/modules');
const INVENTORY_DIRECTORY = join(ROOT, 'docs/acceptance/issue-129/failures');
const REPORT_FILE = join(ROOT, 'docs/acceptance/issue-129/failures.md');
const INPUT_INVENTORY_DIRECTORY = join(
  ROOT,
  'docs/acceptance/issue-128/inputs',
);

interface FailureRecord {
  actions: Array<string>;
  body: boolean;
  codes: boolean;
  decode: boolean;
  evidence: Array<string>;
  local: boolean;
  module: string;
  multi: boolean;
  shape: boolean;
  special: string;
  upload: boolean;
}

const KERNEL_SOURCES = [
  ['UpstreamBusinessFailed / ProtocolFailed(reason=business)', 'business'],
  ['UpstreamRateLimited', 'rateLimited'],
  ['UnexpectedUpstreamShape', 'upstreamShape'],
  ['DeadlineExceeded', 'timeout'],
  ['caller AbortSignal / interrupt', 'cancelled'],
  ['InvalidRequest / TargetRejected / InvalidModuleInput', 'invalidRequest'],
  ['TransportFailed / ResponseDecodeFailed / ProtocolFailed', 'transport'],
  ['unrecognized defect / legacy envelope / ModuleInvariantFailed', 'unknown'],
] as const;

const ERROR_CLASSES = new Map<string, string>([
  ['InvalidRequest', 'invalidRequest'],
  ['TargetRejected', 'invalidRequest'],
  ['UpstreamRateLimited', 'rateLimited'],
  ['DeadlineExceeded', 'timeout'],
  ['TransportFailed', 'transport'],
  ['ResponseDecodeFailed', 'transport'],
  ['ProtocolFailed', 'business|transport'],
  ['InvalidModuleInput', 'invalidRequest'],
  ['UnexpectedUpstreamShape', 'upstreamShape'],
  ['UpstreamBusinessFailed', 'business'],
  ['PartialUpload', 'wraps cause'],
  ['ModuleInvariantFailed', 'unknown'],
]);

const SPECIAL_MODULES = new Map<string, string>([
  ['cloud', 'uploadWork 多阶段与部分完成'],
  ['avatar_upload', 'uploadWork 多阶段与部分完成'],
  ['cloud_import', 'check 读 + import 写'],
  ['inner_version', '纯本地，无网络来源'],
  ['login', '特殊 502 业务码本地改写与 Cookie 检查'],
  ['login_qr_check', '成功码 800-803 与 8821 业务拒绝'],
  ['login_qr_create', '本地二维码不变式（unknown）'],
  ['playlist_cover_update', 'uploadWork 多阶段与部分完成'],
  ['playlist_track_all', 'playlist 读 + songs 批量读'],
  ['playlist_tracks', '512 fallback 第二次写请求'],
  ['scrobble', 'start + play 两次写'],
  ['song_url', '手工 data 数组校验与合成 code 200'],
  ['verify_getQr', '上游 read + 本地二维码不变式（unknown）'],
  ['voice_upload', 'uploadWork 多阶段与部分完成'],
]);

const sourceOf = (identifier: string) =>
  readFile(join(MODULES_DIRECTORY, `${identifier}.ts`), 'utf8');

const deriveFacts = async (identifier: string) => {
  const source = await sourceOf(identifier);
  const actions = Object.keys(
    sdkModuleRegistry[identifier as keyof typeof sdkModuleRegistry].actions,
  ).toSorted();
  return {
    actions,
    body: /export\s+(?:interface|type)\s+ModuleBody\b/u.test(source),
    codes: /codes:\s*\[/u.test(source),
    decode: source.includes('decodeUpstreamBody'),
    local: actions.length === 0,
    multi: (source.match(/request\('/gu) ?? []).length > 1,
    shape: source.includes('UnexpectedUpstreamShape'),
    upload: source.includes('uploadWork'),
  } satisfies Partial<FailureRecord>;
};

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const evidenceRank = (file: string) =>
  file.startsWith('tests/replay/')
    ? 0
    : file.startsWith('tests/behavior/')
      ? 1
      : 2;

const collectEvidence = async (identifiers: ReadonlyArray<string>) => {
  const files = await Array.fromAsync(
    new Bun.Glob('tests/**/*.ts').scan({ cwd: ROOT }),
  );
  const sources = await Promise.all(
    files.map(async (file) => ({
      file,
      source: await readFile(join(ROOT, file), 'utf8'),
    })),
  );
  return new Map(
    identifiers.map((identifier) => {
      const pattern = new RegExp(`\\b${escapeRegExp(identifier)}\\b`, 'u');
      const matches = sources
        .filter(({ source }) => pattern.test(source))
        .map(({ file }) => file)
        .toSorted(
          (left, right) =>
            evidenceRank(left) - evidenceRank(right) ||
            left.localeCompare(right),
        )
        .slice(0, 3);
      return [identifier, matches.length ? matches : ['shared-kernel']];
    }),
  );
};

const readDomainMap = async () => {
  const map = new Map<string, string>();
  const files = await readdir(INPUT_INVENTORY_DIRECTORY).catch(() => []);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const records = JSON.parse(
      await readFile(join(INPUT_INVENTORY_DIRECTORY, file), 'utf8'),
    ) as ReadonlyArray<{ module: string }>;
    for (const record of records) {
      map.set(record.module, file.slice(0, -'.json'.length));
    }
  }
  return map;
};

const readInventory = async () => {
  await mkdir(INVENTORY_DIRECTORY, { recursive: true });
  const files = (await readdir(INVENTORY_DIRECTORY)).filter((file) =>
    file.endsWith('.json'),
  );
  const records: Array<FailureRecord & { domain: string }> = [];
  for (const file of files) {
    const domain = file.slice(0, -'.json'.length);
    const entries = JSON.parse(
      await readFile(join(INVENTORY_DIRECTORY, file), 'utf8'),
    ) as ReadonlyArray<FailureRecord>;
    records.push(...entries.map((entry) => ({ ...entry, domain })));
  }
  return records;
};

const buildRecord = async (
  identifier: string,
  evidence: ReadonlyArray<string>,
  previous?: FailureRecord,
): Promise<FailureRecord> => {
  const facts = await deriveFacts(identifier);
  return {
    module: identifier,
    ...facts,
    special: previous?.special ?? SPECIAL_MODULES.get(identifier) ?? '',
    evidence: [...evidence],
  };
};

const groupByDomain = <Record extends FailureRecord & { domain?: string }>(
  records: ReadonlyArray<Record>,
) => {
  const groups = new Map<string, Array<Record>>();
  for (const record of records) {
    const domain = record.domain ?? 'misc';
    const entries = groups.get(domain) ?? [];
    entries.push(record);
    groups.set(domain, entries);
  }
  for (const entries of groups.values()) {
    entries.sort((left, right) => left.module.localeCompare(right.module));
  }
  return new Map(
    [...groups.entries()].toSorted(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
};

const renderReport = (
  records: ReadonlyArray<FailureRecord & { domain?: string }>,
) => {
  const lines = [
    '# #129 全量失败路径清单',
    '',
    '由 `bun run failures:report` 从 `docs/acceptance/issue-129/failures/*.json` 生成，不手工编辑。',
    '',
    '## 内核来源（全部 352 模块）',
    '',
    '| 内部来源 | 公开 kind |',
    '| --- | --- |',
    ...KERNEL_SOURCES.map(([source, kind]) => `| ${source} | \`${kind}\` |`),
    '',
    '`partialCompletion`/`completedStages` 由 `PartialUpload` 保留，不改变失败分类。',
    '内核规则由 `tests/behavior/runtime/failure-contract.test.ts` 和 `tests/unit/runtime/failure-metadata.test.ts` 共享覆盖；下列证据是该模块自己的领域、回放或入口文件，`shared-kernel` 表示只有共享内核证据。',
    '独立 Watchman 继续使用 `WatchmanError`，不在本清单内。',
    '',
    '## 模块清单',
    '',
    '上表是内核来源到公开 kind 的映射；每个模块实际可达的来源取决于它是否发起网络请求。原样返回的模块没有 `upstreamShape`，纯本地模块没有 `business`、`rateLimited`、`transport`、`timeout` 或 `cancelled`。“额外来源”列只列该模块额外的业务码或结构校验分支。',
    '',
  ];
  for (const [domain, entries] of groupByDomain(records)) {
    lines.push(`### ${domain}`, '');
    lines.push(
      '| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |',
      '| --- | --- | --- | --- | --- | --- |',
    );
    for (const entry of entries) {
      const validation = entry.decode
        ? 'decodeUpstreamBody'
        : entry.body
          ? 'ModuleBody（本地拼装）'
          : '原样返回';
      const extra =
        entry.decode || entry.shape ? 'business, upstreamShape' : '—';
      lines.push(
        `| \`${entry.module}\` | ${entry.actions.join(', ') || '—'} | ${validation} | ${extra} | ${entry.special || '—'} | ${entry.evidence.map((file) => `\`${file}\``).join('<br>')} |`,
      );
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
};

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const writeInventory = async () => {
  const identifiers = Object.keys(sdkModuleRegistry).toSorted();
  const [previous, evidence, domains] = await Promise.all([
    readInventory(),
    collectEvidence(identifiers),
    readDomainMap(),
  ]);
  const records = await Promise.all(
    identifiers.map((identifier) =>
      buildRecord(
        identifier,
        evidence.get(identifier) ?? ['shared-kernel'],
        previous.find((entry) => entry.module === identifier),
      ).then((record) => ({
        ...record,
        domain: domains.get(identifier) ?? 'misc',
      })),
    ),
  );
  for (const [domain, entries] of groupByDomain(records)) {
    await writeFile(
      join(INVENTORY_DIRECTORY, `${domain}.json`),
      `${JSON.stringify(
        entries.map(({ domain: _domain, ...entry }) => entry),
        null,
        2,
      )}\n`,
    );
  }
  await writeFile(REPORT_FILE, renderReport(records));
  console.log(
    `failure inventory written: ${records.length} modules, ${
      groupByDomain(records).size
    } domains`,
  );
};

const checkInventory = async () => {
  const identifiers = Object.keys(sdkModuleRegistry).toSorted();
  const records = await readInventory();
  const problems: Array<string> = [];
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.module)) {
      problems.push(`${record.module}: duplicate record`);
    }
    seen.add(record.module);
    const facts = await deriveFacts(record.module).catch(() => undefined);
    if (!facts) {
      problems.push(`${record.module}: missing module source`);
      continue;
    }
    for (const [key, value] of Object.entries(facts)) {
      if (
        JSON.stringify(record[key as keyof FailureRecord]) !==
        JSON.stringify(value)
      ) {
        problems.push(
          `${record.module}: ${key} mismatch (expected ${JSON.stringify(value)}, got ${JSON.stringify(record[key as keyof FailureRecord])})`,
        );
      }
    }
    if (!record.evidence.length) {
      problems.push(`${record.module}: evidence is empty`);
    }
    for (const file of record.evidence) {
      if (file === 'shared-kernel') continue;
      const source = await readFile(join(ROOT, file), 'utf8').catch(
        () => undefined,
      );
      if (source === undefined) {
        problems.push(`${record.module}: evidence file ${file} is missing`);
      } else if (
        !new RegExp(`\\b${escapeRegExp(record.module)}\\b`, 'u').test(source)
      ) {
        problems.push(`${record.module}: evidence ${file} does not name it`);
      }
    }
    if (SPECIAL_MODULES.has(record.module) && !record.special) {
      problems.push(`${record.module}: required special branch note is empty`);
    }
  }
  const missing = identifiers.filter((identifier) => !seen.has(identifier));
  const unknown = records
    .map((record) => record.module)
    .filter((identifier) => !Object.hasOwn(sdkModuleRegistry, identifier));
  if (missing.length) problems.push(`missing modules: ${missing.join(', ')}`);
  if (unknown.length) problems.push(`unknown modules: ${unknown.join(', ')}`);

  const errorsSource = await readFile(join(ROOT, 'src/core/errors.ts'), 'utf8');
  for (const match of errorsSource.matchAll(/export class (\w+)/gu)) {
    const name = match[1]!;
    if (!ERROR_CLASSES.has(name)) {
      problems.push(`unclassified internal error class: ${name}`);
    }
  }
  for (const name of ERROR_CLASSES.keys()) {
    if (!errorsSource.includes(`export class ${name}`)) {
      problems.push(`stale internal error class mapping: ${name}`);
    }
  }

  const report = await readFile(REPORT_FILE, 'utf8').catch(() => '');
  const expected = renderReport(records);
  if (report !== expected) {
    problems.push('failures.md is stale; run `bun run failures:report`');
  }

  if (problems.length) {
    fail(`failure inventory failed:\n- ${problems.join('\n- ')}`);
  }
  console.log(
    `failure inventory ok: ${identifiers.length} modules, ${
      groupByDomain(records).size
    } domains, ${relative(ROOT, REPORT_FILE)}`,
  );
};

const main = async () => {
  const arguments_ = new Set(process.argv.slice(2));
  if (arguments_.has('--write')) {
    await writeInventory();
    return;
  }
  await checkInventory();
};

await main();
