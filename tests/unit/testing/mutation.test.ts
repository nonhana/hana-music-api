import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
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
      mode === 'timeout-title'
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
    const files = {
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
        mode === 'non-assertion-error'
          ? "import { test, expect } from 'bun:test'; import { value } from '../../product.ts'; test('detects mutation', () => { if(value > 1) throw new Error('Unexpected mock setup'); expect(value).toBe(1); });\n"
          : `import { test, expect } from 'bun:test'; import { value, hang } from '../../product.ts'; test(${JSON.stringify(title)}, async () => { if (hang) await new Promise(() => {}); expect(value).toBe(1); });\n`,
      'tests/mutation/targets/playlist-subscribe.ts': `export const mutations = ${JSON.stringify([{ id: mode, file: 'product.ts', ...patch, timeoutMs: mode === 'timeout' ? 200 : 5000, expectedFailures: [mode === 'unrelated-failure' ? 'unrelated title' : title] }])};\n`,
    };
    await Promise.all(
      Object.entries(files).map(([path, body]) =>
        writeFile(resolve(root, path), body),
      ),
    );
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
])(
  'mutation CLI classifies the real subprocess control %s',
  async (mode) => {
    await fixture(mode, async (root) => {
      const before = await fingerprint(root);
      const result = await run(root);
      const expected =
        mode === 'timeout-title'
          ? 'killed'
          : mode === 'baseline-failure'
            ? 'tool-error'
            : ['unrelated-failure', 'non-assertion-error'].includes(mode)
              ? 'invalid'
              : mode;
      expect(
        result.results.map((entry) => entry.status),
        result.failure,
      ).toEqual([expected]);
      expect(result.exitCode).toBe(
        ['killed', 'timeout-title'].includes(mode) ? 0 : 1,
      );
      expect((await fingerprint(root)).contentSha256).toBe(
        before.contentSha256,
      );
      const report = JSON.parse(await readFile(result.report, 'utf8'));
      expect(report.candidate.contentSha256).toBe(before.contentSha256);
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
