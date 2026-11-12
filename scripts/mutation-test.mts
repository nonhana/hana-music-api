import { execFileSync } from 'node:child_process';
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  rm,
  symlink,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { XML } from 'bun';

import { fingerprint, writeEvidence } from '../tests/_kit/evidence.ts';
import type { TestEntry } from '../tests/suites.ts';

interface Mutation {
  readonly id: string;
  readonly file: string;
  readonly find: string;
  readonly replace: string;
  readonly expectedFailures: ReadonlyArray<string>;
  readonly timeoutMs?: number;
}
const groups = [
  'candidate-package',
  'module-config',
  'request-identity',
  'special-chains',
  'membership-business',
  'podcast-video',
  'account-social',
  'search-discovery',
  'library-playback',
  'check-token',
  'failure-contract',
  'playlist-subscribe',
  'shared-reads',
  'upload',
  'watchman',
  'browser-types',
];

const execute = async (
  command: Array<string>,
  cwd: string,
  prefix: string,
  timeoutMs: number,
) => {
  const child = Bun.spawn(command, {
    cwd,
    env: { ...process.env, LIVE_UPSTREAM: '0' },
    stdout: Bun.file(`${prefix}.stdout`),
    stderr: Bun.file(`${prefix}.stderr`),
  });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, timeoutMs);
  try {
    return {
      command,
      exitCode: await child.exited,
      timedOut,
      stdout: `${prefix}.stdout`,
      stderr: `${prefix}.stderr`,
    };
  } finally {
    clearTimeout(timer);
  }
};

const readJUnit = async (path: string) => {
  const document = XML.parse(await readFile(path, 'utf8'), { compact: false });
  const cases: Array<{
    name: string;
    fullName: string;
    file: string;
    failed: boolean;
    assertionFailure: boolean;
    timeoutFailure: boolean;
    skipped: boolean;
    text: string;
  }> = [];
  const visit = (node: Bun.XML.Node, parents: ReadonlyArray<string> = []) => {
    const names =
      node.name === 'testsuite' && node.attributes.name !== node.attributes.file
        ? [...parents, node.attributes.name ?? '']
        : parents;
    if (node.name === 'testcase') {
      const children = node.children.filter(
        (child): child is Bun.XML.Node =>
          typeof child === 'object' && 'name' in child,
      );
      cases.push({
        name: node.attributes.name ?? '',
        fullName: [...names, node.attributes.name ?? ''].join(' '),
        file: node.attributes.file ?? '',
        failed: children.some((child) =>
          ['failure', 'error'].includes(child.name),
        ),
        assertionFailure: children.some(
          (child) =>
            ['failure', 'error'].includes(child.name) &&
            (child.attributes.type === 'AssertionError' ||
              /(?:^|\n)AssertionError: expect\(received\)/m.test(
                XML.stringify(child),
              )),
        ),
        skipped: children.some((child) => child.name === 'skipped'),
        timeoutFailure: children.some(
          (child) =>
            ['failure', 'error'].includes(child.name) &&
            child.attributes.type === 'TimeoutError',
        ),
        text: XML.stringify(node),
      });
    }
    for (const child of node.children)
      if (typeof child === 'object' && 'name' in child) visit(child, names);
  };
  visit(document);
  if (
    !cases.length ||
    Number(document.attributes.tests) !== cases.length ||
    cases.some((entry) => entry.skipped)
  )
    throw new Error('Empty, omitted or invalid mutation JUnit');
  return cases;
};

export const runMutations = async (
  args: ReadonlyArray<string>,
  root = process.cwd(),
) => {
  const startedAt = new Date().toISOString();
  const candidate = await fingerprint(root);
  const directory = resolve(
    root,
    '.artifacts/testing/mutation',
    `${Date.now()}-${crypto.randomUUID()}`,
  );
  await mkdir(directory, { recursive: true });
  const results: Array<{
    id: string;
    group: string;
    status: string;
    file: string;
    expectedFailures: ReadonlyArray<string>;
    failures?: unknown;
    evidence?: unknown;
    reason?: string;
  }> = [];
  let failure: string | undefined;
  let copy: string | undefined;
  const dryRun = args.includes('--dry-run');
  try {
    const targetIndex = args.indexOf('--target');
    const selected = args.includes('--all')
      ? groups
      : targetIndex >= 0 && args[targetIndex + 1]
        ? [args[targetIndex + 1]!]
        : [];
    const allowedArguments = new Set([
      '--all',
      '--target',
      '--dry-run',
      ...selected,
    ]);
    if (
      !selected.length ||
      selected.some((group) => !groups.includes(group)) ||
      args.some((arg) => !allowedArguments.has(arg)) ||
      (args.includes('--all') && targetIndex >= 0)
    )
      throw new Error(
        'Use --target membership-business|podcast-video|account-social|search-discovery|library-playback|check-token|playlist-subscribe|shared-reads|upload|watchman|browser-types or --all, optionally --dry-run',
      );
    copy = await mkdtemp(resolve(tmpdir(), 'hana-mutation-'));
    const paths = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: root },
    )
      .toString()
      .split('\0')
      .filter(Boolean)
      .filter(
        (path) =>
          !path.startsWith('.artifacts/testing/') &&
          !path.startsWith('docs/acceptance/runs/'),
      );
    for (const path of new Set(paths)) {
      const source = resolve(root, path);
      const metadata = await lstat(source).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return undefined;
          throw error;
        },
      );
      if (!metadata) continue;
      const destination = resolve(copy, path);
      await mkdir(dirname(destination), { recursive: true });
      if (metadata.isSymbolicLink())
        await symlink(await readlink(source), destination);
      else {
        await copyFile(source, destination);
        const copiedAt = new Date();
        await utimes(destination, copiedAt, copiedAt);
      }
    }
    await symlink(
      resolve(root, 'node_modules'),
      resolve(copy, 'node_modules'),
      'dir',
    );
    const selection = (await import(
      pathToFileURL(resolve(root, 'tests/suites.ts')).href
    )) as { testEntries: ReadonlyArray<TestEntry> };
    for (const group of selected) {
      const registered = (await import(
        pathToFileURL(resolve(root, 'tests/mutation/targets', `${group}.ts`))
          .href
      )) as { mutations: ReadonlyArray<Mutation> };
      const files = selection.testEntries
        .filter((entry) => entry.selections.includes(`mutation:${group}`))
        .map((entry) => entry.file);
      if (!files.length || !registered.mutations.length)
        throw new Error(`Empty mutation target ${group}`);
      const baselinePath = resolve(directory, `${group}-baseline.xml`);
      const testCommand = (
        path: string,
        timeout = 5000,
        selectedFiles = files,
      ) => [
        process.execPath,
        'test',
        ...selectedFiles.map((file) => `./${file}`),
        '--preload',
        resolve(import.meta.dir, '../tests/fixtures/consumers/selection.ts'),
        '--preload',
        resolve(import.meta.dir, '../tests/fixtures/consumers/offline.ts'),
        `--timeout=${timeout}`,
        '--reporter=junit',
        `--reporter-outfile=${path}`,
      ];
      const baselineCompile = await execute(
        [process.execPath, 'run', 'typecheck'],
        copy,
        resolve(directory, `${group}-baseline-typecheck`),
        30_000,
      );
      if (baselineCompile.exitCode !== 0 || baselineCompile.timedOut)
        throw new Error(`Typecheck baseline failed for ${group}`);
      const baseline = await execute(
        testCommand(baselinePath),
        copy,
        resolve(directory, `${group}-baseline`),
        30_000,
      );
      const baselineCases = await readJUnit(baselinePath);
      if (
        baseline.exitCode !== 0 ||
        baseline.timedOut ||
        baselineCases.some((entry) => entry.failed)
      )
        throw new Error(`Baseline failed for ${group}`);
      for (const mutation of registered.mutations) {
        const associated = baselineCases.filter((entry) =>
          mutation.expectedFailures.includes(entry.name),
        );
        const selectedFiles = files.filter((file) =>
          associated.some((entry) => entry.file === file),
        );
        if (
          !selectedFiles.length ||
          associated.some((entry) => !selectedFiles.includes(entry.file)) ||
          !mutation.expectedFailures.length ||
          mutation.expectedFailures.some(
            (name) => !name || !associated.some((entry) => entry.name === name),
          )
        ) {
          results.push({
            id: mutation.id,
            group,
            file: mutation.file,
            expectedFailures: mutation.expectedFailures,
            status: 'invalid',
            reason:
              'Expected mutation assertions are absent from registered baseline files',
            evidence: baseline,
          });
          continue;
        }
        const selectedBaseline = baselineCases.filter((entry) =>
          selectedFiles.includes(entry.file),
        );
        const absolute = resolve(copy, mutation.file);
        if (relative(copy, absolute).startsWith('..') || !mutation.find)
          throw new Error('Mutation path or patch is invalid');
        const original = await readFile(absolute, 'utf8');
        if (original.split(mutation.find).length !== 2)
          throw new Error(`Patch must match exactly once: ${mutation.id}`);
        if (dryRun) {
          results.push({
            id: mutation.id,
            group,
            file: mutation.file,
            expectedFailures: mutation.expectedFailures,
            status: 'dry-run',
            evidence: baseline,
          });
          continue;
        }
        try {
          await writeFile(
            absolute,
            original.replace(mutation.find, mutation.replace),
          );
          const compile = await execute(
            [process.execPath, 'run', 'typecheck'],
            copy,
            resolve(directory, `${mutation.id}-typecheck`),
            30_000,
          );
          if (compile.timedOut || compile.exitCode !== 0) {
            results.push({
              id: mutation.id,
              group,
              file: mutation.file,
              expectedFailures: mutation.expectedFailures,
              status: compile.timedOut ? 'timeout' : 'invalid',
              evidence: compile,
            });
            continue;
          }
          const reportPath = resolve(directory, `${mutation.id}.xml`);
          const run = await execute(
            testCommand(reportPath, mutation.timeoutMs ?? 5000, selectedFiles),
            copy,
            resolve(directory, mutation.id),
            (mutation.timeoutMs ?? 5000) + 5000,
          );
          if (run.timedOut) {
            results.push({
              id: mutation.id,
              group,
              file: mutation.file,
              expectedFailures: mutation.expectedFailures,
              status: 'timeout',
              evidence: run,
            });
            continue;
          }
          const cases = await readJUnit(reportPath);
          const failed = cases.filter((entry) => entry.failed);
          const selectionComplete =
            JSON.stringify(
              cases
                .map((entry) => JSON.stringify([entry.file, entry.fullName]))
                .toSorted(),
            ) ===
            JSON.stringify(
              selectedBaseline
                .map((entry) => JSON.stringify([entry.file, entry.fullName]))
                .toSorted(),
            );
          const timeout = failed.some((entry) => entry.timeoutFailure);
          const killed = failed.some(
            (entry) =>
              mutation.expectedFailures.includes(entry.name) &&
              entry.assertionFailure,
          );
          let status;
          if (timeout) status = 'timeout';
          else if (!selectionComplete) status = 'invalid';
          else if (run.exitCode === 0 && !failed.length) status = 'survived';
          else if (killed) status = 'killed';
          else status = 'invalid';
          results.push({
            id: mutation.id,
            group,
            file: mutation.file,
            expectedFailures: mutation.expectedFailures,
            status,
            failures: failed,
            reason: selectionComplete
              ? undefined
              : 'Associated mutation test selection was incomplete or unexpected',
            evidence: run,
          });
        } finally {
          await writeFile(absolute, original);
        }
      }
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
    results.push({
      id: 'runner',
      group: 'setup',
      status: 'tool-error',
      file: '',
      expectedFailures: [],
      reason: failure,
    });
  } finally {
    if (copy) await rm(copy, { recursive: true, force: true });
    if ((await fingerprint(root)).contentSha256 !== candidate.contentSha256)
      failure = 'Original candidate changed during mutation validation';
  }
  const exitCode =
    failure ||
    results.length === 0 ||
    results.some((entry) => !['killed', 'dry-run'].includes(entry.status))
      ? 1
      : 0;
  const report = await writeEvidence(
    {
      suite: 'mutation',
      command: [process.execPath, ...process.argv.slice(1)],
      startedAt,
      candidate,
      exitCode,
      counts: {
        pass: results.filter((entry) =>
          ['killed', 'dry-run'].includes(entry.status),
        ).length,
        fail: results.filter(
          (entry) => !['killed', 'dry-run'].includes(entry.status),
        ).length,
        skip: 0,
      },
      details: {
        mode: dryRun ? 'dry-run' : 'mutation',
        results,
        failure,
        dependencyPolicy: 'read-only symlink; no install',
        networkPolicy: 'offline preload; no live selection',
      },
    },
    root,
    directory,
  );
  return { ...report, results, failure };
};

if (import.meta.main) {
  const report = await runMutations(process.argv.slice(2));
  console.log(
    JSON.stringify({
      status: report.status,
      results: report.results.map(({ id, status }) => ({ id, status })),
      failure: report.failure,
      report: report.artifacts.summary,
    }),
  );
  process.exitCode = report.exitCode;
}
