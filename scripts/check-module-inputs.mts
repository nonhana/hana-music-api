import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
const ROOT = resolve(import.meta.dir, '..');
const MODULES_DIRECTORY = join(ROOT, 'src/modules');
const ACCEPTANCE_DIRECTORY = join(ROOT, 'docs/acceptance/issue-128/inputs');
const REPORT_FILE = join(ROOT, 'docs/acceptance/issue-128/inputs.md');
const FRAGMENT_DIRECTORY = join(ROOT, 'tests/behavior/modules/input-contracts');
const ENCODING_FRAGMENT_DIRECTORY = join(
  ROOT,
  'tests/behavior/modules/input-encoding',
);

// 顺序匹配，前面的规则优先；hot_topic 归消息主题而不是搜索发现。
const DOMAIN_RULES: ReadonlyArray<readonly [string, RegExp]> = [
  [
    'account',
    /^(login|logout|register|captcha|cellphone|rebind|verify|activate|setting|countries|nickname|avatar|inner_version|password)/u,
  ],
  ['user', /^user_/u],
  [
    'social',
    /^(follow$|get_userids|send_|share_|resource_like|hug_|event$|event_)/u,
  ],
  ['album', /^album/u],
  ['artist', /^(artist|artists|ugc_)/u],
  ['toplist-style', /^(toplist|top_|style_|simi_|related_|digitalAlbum)/u],
  ['song-lyric', /^(song|lyric|check_music|scrobble|music_)/u],
  ['playback-video', /^(mv_|video_|cloud_match|audio_match|playmode)/u],
  ['playlist', /^playlist/u],
  [
    'library',
    /^(like|likelist|cloud|pl_count|history|record_|recent_|personal_fm|fm_)/u,
  ],
  ['comment', /^comment/u],
  ['msg-topic', /^(msg_|broadcast|topic|hot_topic|starpick)/u],
  ['dj', /^dj/u],
  ['program-voice', /^(program|voicelist|voice_|radio|mlog)/u],
  [
    'search-discovery',
    /^(search|personalized|recommend|homepage|banner|calendar|hot_|aidj|sheet_|summary|wiki)/u,
  ],
  ['vip-yunbei', /^(vip|yunbei)/u],
  ['musician-signin', /^(musician|sign_|signin|daily_signin)/u],
  ['misc', /^(listentogether|listen_data|batch|image_)/u],
];

interface InputRecord {
  actions: Array<string>;
  businessInput: string;
  current: string;
  evidence: Array<string>;
  fields: Array<string>;
  legacyEncoding: Array<string>;
  module: string;
  notes?: string;
  status: 'migrated' | 'already-compliant' | 'pending';
  upstreamEncoding: string;
}

const classify = (identifier: string): string => {
  for (const [domain, pattern] of DOMAIN_RULES) {
    if (pattern.test(identifier)) return domain;
  }
  throw new Error(`Module "${identifier}" has no input domain`);
};

const captureTypeAlias = (source: string, name: string): string => {
  const start = source.indexOf(`export type ${name}`);
  if (start < 0) return '';
  const assignment = source.indexOf('=', start);
  if (assignment < 0) return '';
  let depth = 0;
  for (let index = assignment + 1; index < source.length; index += 1) {
    const character = source[index]!;
    if ('{([<'.includes(character)) depth += 1;
    else if ('})]>'.includes(character)) depth -= 1;
    else if (character === ';' && depth === 0) {
      return source
        .slice(assignment + 1, index)
        .replaceAll(/\s+/gu, ' ')
        .trim();
    }
  }
  return source
    .slice(assignment + 1)
    .replaceAll(/\s+/gu, ' ')
    .trim();
};

const unique = (values: Iterable<string>): Array<string> =>
  [...new Set(values)].toSorted();

const extractRecord = (identifier: string, source: string): InputRecord => {
  const fields = unique(
    [...source.matchAll(/\b(?:query|input)\.([A-Za-z_][A-Za-z0-9_]*)/gu)].map(
      (match) => match[1]!,
    ),
  );
  const actions = unique(
    [...source.matchAll(/request\('([^']+)'/gu)].map((match) => match[1]!),
  );
  const legacyEncoding = unique(
    [
      ...source.matchAll(/\b(?:split|join)\([^)]*\)/gu),
      ...source.matchAll(/JSON\.stringify/gu),
    ].map((match) => match[0]),
  );
  return {
    module: identifier,
    actions,
    current: captureTypeAlias(source, 'ModuleInput'),
    fields,
    legacyEncoding,
    businessInput: '',
    upstreamEncoding: '',
    evidence: [],
    status: 'pending',
  };
};

const readModules = async (): Promise<
  Array<{ identifier: string; record: InputRecord }>
> => {
  const files = (await readdir(MODULES_DIRECTORY))
    .filter((file) => file.endsWith('.ts'))
    .toSorted();
  return Promise.all(
    files.map(async (file) => {
      const identifier = file.slice(0, -3);
      const source = await readFile(join(MODULES_DIRECTORY, file), 'utf8');
      return { identifier, record: extractRecord(identifier, source) };
    }),
  );
};

const writeSkeletons = async (force: boolean): Promise<void> => {
  await mkdir(ACCEPTANCE_DIRECTORY, { recursive: true });
  const modules = await readModules();
  const grouped = new Map<string, Array<InputRecord>>();
  for (const { identifier, record } of modules) {
    const domain = classify(identifier);
    const list = grouped.get(domain) ?? [];
    list.push(record);
    grouped.set(domain, list);
  }
  for (const [domain, records] of grouped) {
    const path = join(ACCEPTANCE_DIRECTORY, `${domain}.json`);
    if (existsSync(path) && !force) continue;
    await writeFile(path, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  }
  await mkdir(FRAGMENT_DIRECTORY, { recursive: true });
  for (const [domain, records] of grouped) {
    const path = join(FRAGMENT_DIRECTORY, `${domain}.ts`);
    if (existsSync(path) && !force) continue;
    const lines = records
      .map(
        (record) => `  { module: '${record.module}', valid: [], invalid: [] },`,
      )
      .join('\n');
    await writeFile(
      path,
      `import type { ModuleInputCase } from './contract.ts';\n\nexport const cases: ReadonlyArray<ModuleInputCase> = [\n${lines}\n];\n`,
      'utf8',
    );
  }
  await mkdir(ENCODING_FRAGMENT_DIRECTORY, { recursive: true });
  for (const domain of grouped.keys()) {
    const path = join(ENCODING_FRAGMENT_DIRECTORY, `${domain}.ts`);
    if (existsSync(path) && !force) continue;
    await writeFile(
      path,
      `import type { EncodingCase } from './contract.ts';\n\nexport const cases: ReadonlyArray<EncodingCase> = [];\n`,
      'utf8',
    );
  }
  console.log(
    `wrote ${grouped.size} input matrices for ${modules.length} modules`,
  );
};

const readMatrices = async (): Promise<
  Map<string, { domain: string; records: Array<InputRecord> }>
> => {
  const files = (await readdir(ACCEPTANCE_DIRECTORY))
    .filter((file) => file.endsWith('.json'))
    .toSorted();
  const matrices = new Map<
    string,
    { domain: string; records: Array<InputRecord> }
  >();
  for (const file of files) {
    const domain = file.slice(0, -5);
    const parsed: unknown = JSON.parse(
      await readFile(join(ACCEPTANCE_DIRECTORY, file), 'utf8'),
    );
    if (!Array.isArray(parsed)) {
      throw new Error(`${file} must contain an array`);
    }
    matrices.set(domain, { domain, records: parsed as Array<InputRecord> });
  }
  return matrices;
};

const renderMarkdown = (
  matrices: Map<string, { domain: string; records: Array<InputRecord> }>,
): string => {
  const lines = [
    '# #128 全量输入与编码清单',
    '',
    '由 `bun run inputs:report` 从 `docs/acceptance/issue-128/inputs/*.json` 生成，不手工编辑。',
    '',
  ];
  let total = 0;
  const counts = new Map<string, number>();
  for (const { domain, records } of matrices.values()) {
    lines.push(`## ${domain}`, '');
    lines.push(
      '| 模块 | 动作 | 当前声明 | 读取字段 | 旧编码 | 新业务输入 | 上游编码 | 证据 | 状态 |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    );
    for (const record of records) {
      total += 1;
      counts.set(record.status, (counts.get(record.status) ?? 0) + 1);
      lines.push(
        `| \`${record.module}\` | ${record.actions.join(', ') || '-'} | \`${record.current.replaceAll('|', '\\|')}\` | ${record.fields.join(', ') || '-'} | ${record.legacyEncoding.join(', ') || '-'} | \`${record.businessInput.replaceAll('|', '\\|')}\` | ${record.upstreamEncoding.replaceAll('|', '\\|') || '-'} | ${record.evidence.map((item: string) => `\`${item}\``).join('<br>') || '-'} | ${record.status} |`,
      );
    }
    lines.push('');
  }
  lines.push(
    `合计 ${total} 个模块：${[...counts].map(([status, count]) => `${status} ${count}`).join('，')}`,
    '',
  );
  return lines.join('\n');
};

const check = async (final: boolean): Promise<void> => {
  const modules = await readModules();
  const expected = new Set(modules.map(({ identifier }) => identifier));
  const matrices = await readMatrices();
  const seen = new Map<string, string>();
  const errors: Array<string> = [];
  for (const { domain, records } of matrices.values()) {
    for (const record of records) {
      if (!expected.has(record.module)) {
        errors.push(`${domain}: unknown module ${record.module}`);
      }
      const previous = seen.get(record.module);
      if (previous !== undefined) {
        errors.push(`${record.module} appears in ${previous} and ${domain}`);
      }
      seen.set(record.module, domain);
      if (final) {
        if (
          record.status !== 'migrated' &&
          record.status !== 'already-compliant'
        ) {
          errors.push(`${record.module}: status is ${record.status}`);
        }
        if (record.businessInput.trim() === '') {
          errors.push(`${record.module}: businessInput is empty`);
        }
        if (record.evidence.length === 0) {
          errors.push(`${record.module}: evidence is empty`);
        }
        for (const evidence of record.evidence) {
          if (!existsSync(join(ROOT, evidence))) {
            errors.push(`${record.module}: evidence missing ${evidence}`);
          }
        }
        if (record.legacyEncoding.length > 0) {
          errors.push(
            `${record.module}: legacy encoding remains ${record.legacyEncoding.join(', ')}`,
          );
        }
      }
    }
  }
  for (const { identifier } of modules) {
    if (!seen.has(identifier)) errors.push(`${identifier}: missing record`);
  }
  if (final) {
    for (const { identifier, record } of modules) {
      if (record.current.includes('LegacyModuleInput')) {
        errors.push(`${identifier}: source still declares LegacyModuleInput`);
      }
    }
  }
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }
  await writeFile(REPORT_FILE, renderMarkdown(matrices), 'utf8');
  console.log(
    `input matrix covers ${seen.size}/${expected.size} modules${final ? ' (final)' : ''}`,
  );
};

const list = async (): Promise<void> => {
  const modules = await readModules();
  const grouped = new Map<string, Array<string>>();
  for (const { identifier } of modules) {
    const domain = classify(identifier);
    const names = grouped.get(domain) ?? [];
    names.push(identifier);
    grouped.set(domain, names);
  }
  for (const [domain, names] of grouped) {
    console.log(`\n${domain} (${names.length})`);
    console.log(names.join(' '));
  }
};

const main = async (): Promise<void> => {
  const arguments_ = new Set(process.argv.slice(2));
  if (arguments_.has('--write-skeleton')) {
    await writeSkeletons(arguments_.has('--force'));
    return;
  }
  if (arguments_.has('--list')) {
    await list();
    return;
  }
  await check(arguments_.has('--final'));
};

await main();
