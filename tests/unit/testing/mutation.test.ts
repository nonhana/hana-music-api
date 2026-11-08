import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { projectRoot } from '../../_kit/assertions.ts';
import { fingerprint } from '../../_kit/evidence.ts';

const fixture = async (mode: string, work: (root: string) => Promise<void>) => {
  const root = await mkdtemp(resolve(tmpdir(), 'hana-mutation-control-'));
  try {
    const title =
      mode === 'regex-title'
        ? 'detects mutation (value[0])? $'
        : mode === 'timeout-title'
          ? 'detects mutation after a timed out operation'
          : 'detects mutation';
    await mkdir(resolve(root, 'tests/mutation/targets'), { recursive: true });
    await mkdir(resolve(root, 'tests/behavior'), { recursive: true });
    await symlink(
      resolve(projectRoot, 'node_modules'),
      resolve(root, 'node_modules'),
      'dir',
    );
    const patch =
      mode === 'survived'
        ? { find: 'unused = 1', replace: 'unused = 2' }
        : mode === 'invalid'
          ? { find: 'value = 1', replace: 'value = )' }
          : mode === 'timeout'
            ? { find: 'hang = false', replace: 'hang = true' }
            : { find: 'value = 1', replace: 'value = 2' };
    const controls: Record<string, string> = {
      'fresh-copy':
        "import { test, expect } from 'bun:test'; import { readFile, stat } from 'node:fs/promises'; import { value } from '../../product.ts'; test('detects mutation', async () => { const file = new URL('../../stale-recording.json', import.meta.url); expect((await stat(file)).mtimeMs).toBeGreaterThan(Date.now() - 60_000); expect(JSON.parse(await readFile(file, 'utf8')).payload).toBe('x'.repeat(144000)); expect(value).toBe(1); });\n",
      'skipped-associated':
        "import { test, expect } from 'bun:test'; import { value } from '../../product.ts'; test.skipIf(value > 1)('detects mutation', () => expect(value).toBe(1));\n",
      'regex-title': `import { describe, test, expect } from 'bun:test'; import { value } from '../../product.ts'; describe('outer (suite)?', () => describe('inner[context]', () => { test(${JSON.stringify(title)}, () => expect(value).toBe(1)); test(${JSON.stringify('prefix ' + title)}, () => expect(value).toBe(1)); }));\n`,
      'omitted-associated':
        "import { test, expect } from 'bun:test'; import { value } from '../../product.ts'; test('detects mutation', () => expect(value).toBe(1)); test(value === 1 ? 'secondary assertion' : 'renamed assertion', () => expect(value).toBe(1));\n",
      'non-assertion-error':
        "import { test, expect } from 'bun:test'; import { value } from '../../product.ts'; test('detects mutation', () => { if(value > 1) throw new Error('Unexpected mock setup'); expect(value).toBe(1); });\n",
    };
    const expectedFailures =
      mode === 'empty-associated'
        ? []
        : mode === 'omitted-associated'
          ? [title, 'secondary assertion']
          : [mode === 'unrelated-failure' ? 'unrelated title' : title];
    const files: Record<string, string> = {
      '.gitignore': 'node_modules\n.artifacts/\n',
      'package.json': JSON.stringify({
        type: 'module',
        scripts: { typecheck: 'tsc --noEmit' },
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          module: 'ESNext',
          target: 'ESNext',
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          skipLibCheck: true,
          types: ['bun'],
          noEmit: true,
        },
        include: ['product.ts', 'tests/**/*.ts'],
      }),
      'product.ts': `export const value = ${mode === 'baseline-failure' ? 0 : 1}; export const unused = 1; export const hang = false;\n`,
      'tests/suites.ts':
        "export const testEntries = [{ file: 'tests/behavior/control.test.ts', category: 'behavior', selections: ['mutation:playlist-subscribe'] }];\n",
      'tests/behavior/control.test.ts':
        controls[mode] ??
        `import { test, expect } from 'bun:test'; import { value, hang } from '../../product.ts'; test(${JSON.stringify(title)}, async () => { if (hang) await new Promise(() => {}); expect(value).toBe(1); });\n`,
      'tests/mutation/targets/playlist-subscribe.ts': `export const mutations = ${JSON.stringify([{ id: mode, file: 'product.ts', ...patch, timeoutMs: ['timeout', 'associated-selection'].includes(mode) ? 200 : 5000, expectedFailures }])};\n`,
    };
    if (mode === 'associated-selection') {
      files['tests/suites.ts'] =
        "export const testEntries = ['control', 'unrelated'].map(name => ({ file: `tests/behavior/${name}.test.ts`, category: 'behavior', selections: ['mutation:playlist-subscribe'] }));\n";
      files['tests/behavior/unrelated.test.ts'] =
        `import { test, expect } from 'bun:test'; import { appendFile } from 'node:fs/promises'; import { value } from '../../product.ts'; test('unrelated slow control', async () => { await appendFile(${JSON.stringify(resolve(root, '.artifacts/testing/selection-trace.jsonl'))}, String(value) + '\\n'); if(value > 1) await new Promise(() => {}); expect(value).toBe(1); });\n`;
    }
    await Promise.all(
      Object.entries(files).map(([path, body]) =>
        writeFile(resolve(root, path), body),
      ),
    );
    if (mode === 'fresh-copy') {
      const recording = resolve(root, 'stale-recording.json');
      await writeFile(
        recording,
        JSON.stringify({ payload: 'x'.repeat(144000) }),
      );
      await utimes(recording, 1, 1);
    }
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.com',
        'commit',
        '-qm',
        'control',
      ],
      { cwd: root },
    );
    await work(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const run = async (root: string, extra: Array<string> = []) => {
  const child = Bun.spawn(
    [
      process.execPath,
      resolve(projectRoot, 'scripts/mutation-test.mts'),
      '--target',
      'playlist-subscribe',
      ...extra,
    ],
    { cwd: root, stdout: 'pipe', stderr: 'pipe' },
  );
  const [exitCode, output, errors] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(output, errors).not.toBe('');
  const result = JSON.parse(output) as {
    status: string;
    results: Array<{ id: string; status: string }>;
    report: string;
    failure?: string;
  };
  return { ...result, exitCode };
};

test.each([
  'killed',
  'survived',
  'invalid',
  'timeout',
  'timeout-title',
  'baseline-failure',
  'unrelated-failure',
  'non-assertion-error',
  'associated-selection',
  'regex-title',
  'empty-associated',
  'omitted-associated',
  'skipped-associated',
  'fresh-copy',
])(
  'mutation CLI classifies the real subprocess control %s',
  async (mode) => {
    await fixture(mode, async (root) => {
      const before = await fingerprint(root);
      const result = await run(root);
      const classifications: Record<string, string> = {
        'timeout-title': 'killed',
        'associated-selection': 'killed',
        'regex-title': 'killed',
        'fresh-copy': 'killed',
        'baseline-failure': 'tool-error',
        'skipped-associated': 'tool-error',
        'unrelated-failure': 'invalid',
        'non-assertion-error': 'invalid',
        'empty-associated': 'invalid',
        'omitted-associated': 'invalid',
      };
      const expected = classifications[mode] ?? mode;
      expect(
        result.results.map((entry) => entry.status),
        result.failure,
      ).toEqual([expected]);
      expect(result.exitCode).toBe(expected === 'killed' ? 0 : 1);
      expect((await fingerprint(root)).contentSha256).toBe(
        before.contentSha256,
      );
      if (mode === 'fresh-copy')
        expect(
          (await stat(resolve(root, 'stale-recording.json'))).mtimeMs,
        ).toBe(1000);
      const report = JSON.parse(await readFile(result.report, 'utf8'));
      expect(report.candidate.contentSha256).toBe(before.contentSha256);
      if (mode === 'associated-selection')
        expect(
          await readFile(
            resolve(root, '.artifacts/testing/selection-trace.jsonl'),
            'utf8',
          ),
        ).toBe('1\n');
      expect(await readFile(resolve(root, 'product.ts'), 'utf8')).toContain(
        mode === 'baseline-failure' ? 'value = 0' : 'value = 1',
      );
    });
  },
  60_000,
);

test('mutation dry-run validates a green baseline and patch scope without injecting the fault', async () => {
  await fixture('killed', async (root) => {
    const result = await run(root, ['--dry-run']);
    expect(result.exitCode, result.failure).toBe(0);
    expect(result.results.map((entry) => entry.status)).toEqual(['dry-run']);
    expect(await readFile(resolve(root, 'product.ts'), 'utf8')).toContain(
      'value = 1',
    );
  });
}, 60_000);

test.each(['empty-associated', 'unrelated-failure'])(
  'mutation dry-run refuses invalid associated assertions: %s',
  async (mode) => {
    await fixture(mode, async (root) => {
      const result = await run(root, ['--dry-run']);
      expect(result.exitCode).toBe(1);
      expect(result.results.map((entry) => entry.status)).toEqual(['invalid']);
    });
  },
  60_000,
);
