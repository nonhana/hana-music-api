#!/usr/bin/env bun

/**
 * Schema 审计 CLI：给返回体补全工作流提供可重复的覆盖、证据和静态检查。
 *
 * 用法：
 *   bun run schema:audit status [--list]
 *   bun run schema:audit module <module> [--recordings <root>]
 *   bun run schema:audit recordings [root]
 *   bun run schema:audit check
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { gunzipSync } from 'node:zlib';

const scriptDir = import.meta.dir;
const repoRoot = resolve(scriptDir, '..');
const modulesDir = join(repoRoot, 'src/modules');
const coreSchemaFile = join(repoRoot, 'src/core/upstream-schemas.ts');
const defaultRecordingsRoot =
  process.env.CAMPANULA_FIXTURES ??
  resolve(repoRoot, '../campanula-svelte-main/tests/fixtures/netease');

const out = (message: string) => process.stdout.write(`${message}\n`);
const err = (message: string) => process.stderr.write(`${message}\n`);

type StandardSchema = {
  readonly '~standard': {
    readonly validate: (input: unknown) => unknown;
  };
};

type ValidationResult = {
  readonly issues?: ReadonlyArray<unknown>;
  readonly value?: unknown;
};

type RecordingPart = {
  readonly index?: number;
  readonly of?: number;
  readonly final: boolean;
};

type IndexEntry = {
  readonly module?: unknown;
  readonly path?: unknown;
  readonly outcome?: unknown;
  readonly part?: RecordingPart;
  readonly recording?: unknown;
};

type RecordingIndex = {
  readonly entries?: unknown;
};

type IndexStats = {
  readonly noModule: number;
  readonly outcomes: ReadonlyMap<string, number>;
  readonly scanned: number;
  readonly scannedUnit: 'entries' | 'files';
};

type IndexEntries = {
  readonly entries: ReadonlyArray<IndexEntry>;
  readonly stats: IndexStats;
};

type FieldCell = {
  readonly types: Set<string>;
  readonly samples: Array<string>;
  count: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const moduleFileNames = () =>
  readdirSync(modulesDir)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => name.slice(0, -3))
    .toSorted((a, b) => a.localeCompare(b));

const moduleSource = (name: string) =>
  readFileSync(join(modulesDir, `${name}.ts`), 'utf8');

const modulesWithBody = () =>
  moduleFileNames().filter((name) =>
    /export const ModuleBody\b/.test(moduleSource(name)),
  );

const classifyBodyless = (name: string) => {
  const source = moduleSource(name);
  if (name === 'batch') return 'batch';
  if (
    ['avatar_upload', 'cloud', 'voice_upload'].includes(name) ||
    source.includes('uploadWork')
  ) {
    return 'upload';
  }
  return 'raw';
};

const readJson = (file: string): unknown => {
  const bytes = readFileSync(file);
  const text = file.endsWith('.gz')
    ? gunzipSync(bytes).toString('utf8')
    : bytes.toString('utf8');
  return JSON.parse(text);
};

const bodyFromRecording = (recording: unknown): unknown => {
  if (!isRecord(recording) || !isRecord(recording.response)) {
    throw new Error('录制没有 response 对象');
  }
  const body = recording.response.body;
  return isRecord(body) && !('code' in body) && isRecord(body.body)
    ? body.body
    : body;
};

/** 公开体由 SDK 合成、与上游原文不同时，最终体写在 `context.expect`，审计把它当作 ModuleBody 的校验对象。 */
const expectFromRecording = (recording: unknown): unknown => {
  if (!isRecord(recording) || !isRecord(recording.context)) return undefined;
  return 'expect' in recording.context ? recording.context.expect : undefined;
};

/** index 模式在读取 part 时已解析过同一文件，这里复用，避免再整读一遍。 */
const bodyOfEntry = (
  entry: IndexEntry,
  recordingsRoot: string,
  path: string,
): unknown => {
  const recording =
    entry.recording === undefined
      ? readJson(resolve(recordingsRoot, path))
      : entry.recording;
  const expected = expectFromRecording(recording);
  return expected === undefined ? bodyFromRecording(recording) : expected;
};

const recordingFiles = (root: string): ReadonlyArray<string> => {
  const files: Array<string> = [];
  const walk = (directory: string, prefix: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath =
        prefix.length === 0 ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(join(directory, entry.name), relativePath);
        continue;
      }
      if (
        entry.isFile() &&
        (entry.name.endsWith('.json') || entry.name.endsWith('.json.gz')) &&
        entry.name !== 'index.json' &&
        entry.name !== 'index.json.gz'
      ) {
        files.push(relativePath);
      }
    }
  };
  walk(root, '');
  return files;
};

/**
 * 录制自报的 `context.outcome` 优先：`ok` 即成功，其他原值都算非 ok。
 * 没写 outcome 时只看 response.status 和顶层数字 code；data.code 是业务状态
 * （如下载单曲的 -105/-110），不代表接口失败，不参与分类。
 */
const outcomeFromRecording = (recording: unknown): string => {
  if (!isRecord(recording)) {
    return 'rejected';
  }
  const context = recording.context;
  if (isRecord(context)) {
    const declared = context.outcome;
    if (typeof declared === 'string' && declared.trim() !== '') {
      return declared;
    }
  }
  if (!isRecord(recording.response)) {
    return 'rejected';
  }
  const response = recording.response;
  if (response.status !== 200) {
    return 'rejected';
  }
  let body: unknown;
  try {
    body = bodyFromRecording(recording);
  } catch {
    return 'rejected';
  }
  const code = isRecord(body) ? body.code : undefined;
  if (typeof code === 'number' && code !== 200) {
    return 'rejected';
  }
  return 'ok';
};

/**
 * 多请求录制用 `context.part = { index, of, final }` 标记；没有 part 的老录制视为单请求 final。
 * `final: false` 的中间/不完整证据不进入 ModuleBody 校验。
 */
const partOfRecording = (recording: unknown): RecordingPart | undefined => {
  if (!isRecord(recording) || !isRecord(recording.context)) return undefined;
  const part = recording.context.part;
  if (!isRecord(part)) return undefined;
  return {
    index: typeof part.index === 'number' ? part.index : undefined,
    of: typeof part.of === 'number' ? part.of : undefined,
    final: part.final === true,
  };
};

const isExcludedPart = (entry: IndexEntry) => entry.part?.final === false;

/** index 条目没有 outcome 时按非 ok 处理，保持旧计数保守。 */
const entryOutcome = (entry: IndexEntry): string =>
  typeof entry.outcome === 'string' && entry.outcome.trim() !== ''
    ? entry.outcome
    : 'rejected';

const readIndex = (root: string, moduleFilter?: string): IndexEntries => {
  const file = join(root, 'index.json');
  if (existsSync(file)) {
    const parsed = readJson(file) as RecordingIndex;
    if (!Array.isArray(parsed.entries)) {
      throw new Error(`${file} 的 entries 不是数组`);
    }
    // index 本身不带 part；从录制文件推导，老录制没有 part 就当单请求 final。
    const entries = parsed.entries.filter(isRecord).map((entry) => {
      if (
        typeof entry.module !== 'string' ||
        typeof entry.path !== 'string' ||
        (moduleFilter !== undefined && entry.module !== moduleFilter)
      ) {
        return entry;
      }
      const recordingFile = resolve(root, entry.path);
      if (!existsSync(recordingFile)) {
        throw new Error(`读取索引录制 ${entry.path} 失败：文件不存在`);
      }
      let recording: unknown;
      try {
        recording = readJson(recordingFile);
      } catch (error) {
        throw new Error(
          `读取索引录制 ${entry.path} 失败：${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
      return {
        ...entry,
        part: partOfRecording(recording),
        recording,
      };
    });
    const outcomes = new Map<string, number>();
    let noModule = 0;
    for (const entry of entries) {
      if (typeof entry.module !== 'string') {
        noModule += 1;
        continue;
      }
      const outcome = entryOutcome(entry);
      outcomes.set(outcome, (outcomes.get(outcome) ?? 0) + 1);
    }
    return {
      entries,
      stats: {
        scanned: entries.length,
        scannedUnit: 'entries',
        outcomes,
        noModule,
      },
    };
  }
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(
      `找不到录制根目录 ${root}；用 --recordings <root> 指向 index.json 或 SDK 的 tests/fixtures/netease。`,
    );
  }

  const files = recordingFiles(root);
  const entries: Array<IndexEntry> = [];
  const outcomes = new Map<string, number>();
  let noModule = 0;
  for (const relativePath of files) {
    let recording: unknown;
    try {
      recording = readJson(join(root, relativePath));
    } catch (error: unknown) {
      throw new Error(
        `读取录制 ${relativePath} 失败：${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
    if (!isRecord(recording) || typeof recording.module !== 'string') {
      noModule += 1;
      continue;
    }
    const outcome = outcomeFromRecording(recording);
    outcomes.set(outcome, (outcomes.get(outcome) ?? 0) + 1);
    entries.push({
      module: recording.module,
      path: relativePath,
      outcome,
      part: partOfRecording(recording),
    });
  }
  return {
    entries: entries.toSorted((left, right) =>
      String(left.path).localeCompare(String(right.path)),
    ),
    stats: { scanned: files.length, scannedUnit: 'files', outcomes, noModule },
  };
};

const schemaCache = new Map<string, StandardSchema | null>();

const loadSchema = async (moduleName: string) => {
  if (schemaCache.has(moduleName)) return schemaCache.get(moduleName);
  const file = join(modulesDir, `${moduleName}.ts`);
  if (!existsSync(file)) {
    schemaCache.set(moduleName, null);
    return null;
  }
  const imported = (await import(pathToFileURL(file).href)) as {
    readonly ModuleBody?: StandardSchema;
  };
  const schema = imported.ModuleBody ?? null;
  schemaCache.set(moduleName, schema);
  return schema;
};

const validate = (schema: StandardSchema, input: unknown): ValidationResult => {
  const result = schema['~standard'].validate(input);
  if (result instanceof Promise) {
    throw new Error('结构定义的 ~standard.validate 返回了 Promise');
  }
  return result as ValidationResult;
};

const typeOf = (value: unknown) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

const sampleOf = (value: unknown) => {
  const text = JSON.stringify(value);
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
};

const addCell = (
  cells: Map<string, FieldCell>,
  path: string,
  value: unknown,
  type = typeOf(value),
) => {
  const cell = cells.get(path) ?? {
    types: new Set<string>(),
    samples: [],
    count: 0,
  };
  cell.count += 1;
  cell.types.add(type);
  if (value !== null && value !== undefined && cell.samples.length < 2) {
    cell.samples.push(sampleOf(value));
  }
  cells.set(path, cell);
};

const collectFields = (
  value: unknown,
  path: string,
  cells: Map<string, FieldCell>,
) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      addCell(cells, path, value, 'array(empty)');
      return;
    }
    for (const item of value) {
      collectFields(item, `${path}[]`, cells);
    }
    return;
  }
  if (isRecord(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      addCell(cells, path, value, 'object(empty)');
      return;
    }
    for (const key of keys) {
      collectFields(
        value[key],
        path.length === 0 ? key : `${path}.${key}`,
        cells,
      );
    }
    return;
  }
  addCell(cells, path, value);
};

const parseOptions = (rawArgs: ReadonlyArray<string>) => {
  const args = [...rawArgs];
  const recordingsIndex = args.indexOf('--recordings');
  const explicitRecordings =
    recordingsIndex >= 0 ? args[recordingsIndex + 1] : undefined;
  const recordingsRoot = explicitRecordings ?? defaultRecordingsRoot;
  if (recordingsIndex >= 0) {
    args.splice(recordingsIndex, 2);
  }
  return {
    args,
    list: args.includes('--list'),
    recordingsRoot,
  };
};

const statusCommand = (list: boolean) => {
  const all = moduleFileNames();
  const withBody = modulesWithBody();
  const bodyless = all.filter((name) => !withBody.includes(name));
  const upload = bodyless.filter((name) => classifyBodyless(name) === 'upload');
  const batch = bodyless.filter((name) => classifyBodyless(name) === 'batch');
  const raw = bodyless.filter((name) => classifyBodyless(name) === 'raw');

  out(`modules: ${all.length} total`);
  out(`  with ModuleBody: ${withBody.length}`);
  out(`  without ModuleBody: ${bodyless.length}`);
  out(`    raw responses: ${raw.length}`);
  out(`    batch: ${batch.length}`);
  out(`    upload workflows: ${upload.length}`);
  if (list) {
    out('');
    out('raw:');
    for (const name of raw) out(`  ${name}`);
    out('batch:');
    for (const name of batch) out(`  ${name}`);
    out('upload:');
    for (const name of upload) out(`  ${name}`);
  }
};

const checkCommand = () => {
  const issues: Array<string> = [];
  const sourceFiles = [
    coreSchemaFile,
    ...moduleFileNames().map((name) => join(modulesDir, `${name}.ts`)),
  ];
  for (const file of sourceFiles) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const [index, line] of lines.entries()) {
      if (line.includes('Schema.MutableJson')) {
        issues.push(`${file}:${index + 1}: 字段声明使用了 Schema.MutableJson`);
      }
    }
  }

  for (const name of modulesWithBody()) {
    const lines = moduleSource(name).split('\n');
    const marker = lines.findIndex((line) =>
      line.startsWith('export const ModuleBody'),
    );
    let previous = marker - 1;
    while (previous >= 0 && lines[previous]?.trim() === '') previous -= 1;
    if (previous < 0 || !lines[previous]?.trim().startsWith('//')) {
      issues.push(`${name}: ModuleBody 正上方缺少一句说明路径和用途的注释`);
    }
  }

  if (issues.length === 0) {
    out('schema checks: ok');
    return;
  }
  out(`schema checks: ${issues.length} issue(s)`);
  for (const issue of issues) out(`  ${issue}`);
  process.exitCode = 1;
};

const outcomeOrder = (name: string) =>
  name === 'rejected' ? 0 : name === 'rateLimited' ? 1 : 3;

/** 按 outcome 分组输出；ok 固定第一行，其余先 rejected/rateLimited 再按名称排序。 */
const printOutcomeCounts = (outcomes: ReadonlyMap<string, number>) => {
  out(`  ok: ${outcomes.get('ok') ?? 0}`);
  const rest = [...outcomes.entries()]
    .filter(([name]) => name !== 'ok')
    .toSorted(
      ([left], [right]) =>
        outcomeOrder(left) - outcomeOrder(right) || left.localeCompare(right),
    );
  for (const [name, count] of rest) out(`  ${name}: ${count}`);
};

const moduleCommand = (moduleName: string, recordingsRoot: string) => {
  const moduleEntries = readIndex(recordingsRoot, moduleName).entries.filter(
    (entry) => entry.module === moduleName,
  );
  const outcomes = new Map<string, number>();
  for (const entry of moduleEntries) {
    const outcome = entryOutcome(entry);
    outcomes.set(outcome, (outcomes.get(outcome) ?? 0) + 1);
  }
  const multiPartCount = moduleEntries.filter(isExcludedPart).length;
  // 只有 final:true 的录制对应 ModuleBody；中间/不完整证据不进入字段矩阵。
  const entries = moduleEntries.filter(
    (entry) => entryOutcome(entry) === 'ok' && !isExcludedPart(entry),
  );

  out(`module: ${moduleName}`);
  out(`recordings: ${moduleEntries.length}`);
  printOutcomeCounts(outcomes);
  if (multiPartCount > 0) {
    out(`  multi-part: ${multiPartCount} (excluded)`);
  }

  if (entries.length === 0) {
    throw new Error(
      `${moduleName} 在 ${recordingsRoot} 里没有 final:true 的成功录制（共 ${moduleEntries.length} 份，其中 multi-part ${multiPartCount} 份）。`,
    );
  }

  const cells = new Map<string, FieldCell>();
  for (const entry of entries) {
    if (typeof entry.path !== 'string') continue;
    const body = bodyOfEntry(entry, recordingsRoot, entry.path);
    collectFields(body, '', cells);
  }

  out('path\ttypes\tcount\tsamples');
  for (const [path, cell] of [...cells.entries()].toSorted(([a], [b]) =>
    a.localeCompare(b),
  )) {
    out(
      `${path}\t${[...cell.types].toSorted((a, b) => a.localeCompare(b)).join('|')}\t${cell.count}\t${cell.samples.join(' | ')}`,
    );
  }
};

const recordingsCommand = async (recordingsRoot: string, list: boolean) => {
  const { entries: allEntries, stats } = readIndex(recordingsRoot);
  // final:false 的中间/不完整证据只计数，不做 ModuleBody 校验。
  const multiPartEntries = allEntries.filter(
    (entry) => typeof entry.module === 'string' && isExcludedPart(entry),
  );
  // 没有 module 的条目只进 no-module 计数，不当作可校验录制。
  const entries = allEntries.filter(
    (entry) =>
      typeof entry.module === 'string' &&
      entryOutcome(entry) === 'ok' &&
      !isExcludedPart(entry),
  );
  const skipped = new Map<string, number>();
  const failures: Array<{ path: string; reason: string }> = [];
  const seenModules = new Set<string>();
  let validated = 0;

  const moduleNames = [
    ...new Set(
      entries.flatMap((entry) =>
        typeof entry.module === 'string' ? [entry.module] : [],
      ),
    ),
  ];
  await Promise.all(moduleNames.map((name) => loadSchema(name)));

  for (const entry of entries) {
    const moduleName =
      typeof entry.module === 'string' ? entry.module : undefined;
    const recordingPath =
      typeof entry.path === 'string' ? entry.path : undefined;
    if (!moduleName || !recordingPath) {
      failures.push({ path: '<unknown>', reason: '录制条目缺 module/path' });
      continue;
    }
    seenModules.add(moduleName);
    const schema = schemaCache.get(moduleName) ?? null;
    if (!schema) {
      skipped.set(moduleName, (skipped.get(moduleName) ?? 0) + 1);
      continue;
    }

    try {
      const body = bodyOfEntry(entry, recordingsRoot, recordingPath);
      const result = validate(schema, body);
      if (result.issues && result.issues.length > 0) {
        failures.push({
          path: recordingPath,
          reason: JSON.stringify(result.issues).slice(0, 500),
        });
      } else if (!isDeepStrictEqual(result.value, body)) {
        failures.push({
          path: recordingPath,
          reason: '校验结果与原始返回不一致（字段被丢弃或改写）',
        });
      } else {
        validated += 1;
      }
    } catch (error) {
      failures.push({
        path: recordingPath,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const bodyModules = modulesWithBody();
  const noRecording = bodyModules.filter((name) => !seenModules.has(name));
  const okCount = stats.outcomes.get('ok') ?? 0;
  const excludedOk = multiPartEntries.filter(
    (entry) => entryOutcome(entry) === 'ok',
  ).length;
  out(
    excludedOk > 0
      ? `recordings: ${okCount} ok entries (${okCount - excludedOk} eligible, ${excludedOk} multi-part excluded)`
      : `recordings: ${okCount} ok entries`,
  );
  // index 模式按 entries 计，直接扫描目录按文件计；两个数字来源不同，不能混用。
  out(`  scanned: ${stats.scanned} ${stats.scannedUnit}`);
  printOutcomeCounts(stats.outcomes);
  if (multiPartEntries.length > 0) {
    out(`  multi-part: ${multiPartEntries.length} (excluded)`);
  }
  out(`  no-module: ${stats.noModule}`);
  out(`  validated: ${validated}`);
  out(
    `  skipped (no ModuleBody): ${[...skipped.values()].reduce((a, b) => a + b, 0)}`,
  );
  for (const [name, count] of skipped) out(`    ${name}: ${count}`);
  out(`  failures: ${failures.length}`);
  for (const failure of failures.slice(0, 20)) {
    out(`    ${failure.path}: ${failure.reason}`);
  }
  if (failures.length > 20) {
    out(`    … ${failures.length - 20} more`);
  }
  if (list) {
    out(`  body modules without auditable recordings: ${noRecording.length}`);
    for (const name of noRecording) out(`    ${name}`);
  }
  if (failures.length > 0) process.exitCode = 1;
};

const help = () => {
  out(`schema-audit <command> [options]

commands:
  status [--list]                 模块覆盖统计
  module <name> [--recordings]    输出模块的录制字段矩阵
  recordings [root] [--list]      校验录制并逐字段比较
  check                           检查 MutableJson 与 ModuleBody 注释

default recordings:
  ${defaultRecordingsRoot}`);
};

const main = async () => {
  const [command = 'status', ...rawArgs] = process.argv.slice(2);
  const { args, list, recordingsRoot } = parseOptions(rawArgs);

  switch (command) {
    case 'status':
      statusCommand(list);
      return;
    case 'check':
      checkCommand();
      return;
    case 'module': {
      const moduleName = args.find((arg) => !arg.startsWith('--'));
      if (!moduleName) throw new Error('module 命令需要模块名');
      moduleCommand(moduleName, recordingsRoot);
      return;
    }
    case 'recordings': {
      const root = args.find((arg) => !arg.startsWith('--')) ?? recordingsRoot;
      await recordingsCommand(root, list);
      return;
    }
    case 'help':
    case '--help':
    case '-h':
      help();
      return;
    default:
      throw new Error(`未知命令：${command}`);
  }
};

try {
  await main();
} catch (error: unknown) {
  err(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
