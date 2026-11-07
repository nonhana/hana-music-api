import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { runSuite } from '../../../scripts/test.mts';
import { fingerprint } from '../../_kit/evidence.ts';

const fixture = async (body: string, run: (root: string) => Promise<void>) => {
  const root = await mkdtemp(resolve(tmpdir(), 'hana-runner-'));
  try {
    await mkdir(resolve(root, 'tests/unit'), { recursive: true });
    await writeFile(resolve(root, 'tests/unit/example.test.ts'), body);
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
        'fixture',
      ],
      { cwd: root },
    );
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const entries = [
  {
    file: 'tests/unit/example.test.ts',
    category: 'unit' as const,
    selections: ['local'],
  },
];
const passing =
  "import { test, expect } from 'bun:test'; test('works', () => expect(1).toBe(1));";

test('runner binds successful counts and selected files to the candidate', async () => {
  await fixture(passing, async (root) => {
    const result = await runSuite({ root, entries, suite: 'local' });
    expect(result.exitCode, JSON.stringify(result.details)).toBe(0);
    expect(result.counts).toEqual({ pass: 1, fail: 0, skip: 0 });
    expect(result.files).toEqual(entries.map((entry) => entry.file));
    expect(result.candidate.contentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(
      JSON.parse(await readFile(result.artifacts.summary, 'utf8')).status,
    ).toBe('pass');
  });
});

test.each([
  [
    "import { test, expect } from 'bun:test'; test('fails', () => expect(1).toBe(2));",
    'Child failed',
  ],
  ['process.exit(0);', 'ENOENT'],
  ["import { test } from 'bun:test'; test.skip('missing', () => {});", 'skip'],
  ["import { test } from 'bun:test'; test.todo('missing');", 'skip=1'],
  [
    "import { test } from 'bun:test'; test.only('focused', () => {}); test('omitted', () => {});",
    'Focused selection',
  ],
  ['', 'ENOENT'],
])('runner rejects %s (%s)', async (body, reason) => {
  await fixture(body, async (root) => {
    const result = await runSuite({ root, entries, suite: 'local' });
    expect(result.exitCode).not.toBe(0);
    expect(result.status).toBe('fail');
    expect(result.failure).toContain(reason);
  });
});

test('runner rejects missing, unclassified, duplicate and empty selections', async () => {
  await fixture(passing, async (root) => {
    for (const selection of [
      [],
      [...entries, ...entries],
      [{ ...entries[0]!, file: 'tests/unit/missing.test.ts' }],
    ]) {
      expect(
        (await runSuite({ root, entries: selection, suite: 'local' })).exitCode,
      ).not.toBe(0);
    }
    expect(
      (await runSuite({ root, entries, suite: 'unknown' })).exitCode,
    ).not.toBe(0);
    expect(
      (
        await runSuite({
          root,
          entries: [{ ...entries[0]!, selections: ['other'] }],
          suite: 'local',
        })
      ).exitCode,
    ).not.toBe(0);
  });
});

test('candidate includes source changes and untracked files but excludes run records', async () => {
  await fixture(passing, async (root) => {
    const first = await fingerprint(root);
    await mkdir(resolve(root, 'docs/acceptance/runs'), { recursive: true });
    await writeFile(resolve(root, 'docs/acceptance/runs/result.md'), 'runtime');
    expect((await fingerprint(root)).contentSha256).toBe(first.contentSha256);
    await writeFile(resolve(root, 'docs/acceptance/requirement.md'), 'AC');
    expect((await fingerprint(root)).contentSha256).not.toBe(
      first.contentSha256,
    );
    await writeFile(resolve(root, entries[0]!.file), 'changed');
    expect((await fingerprint(root)).contentSha256).not.toBe(
      first.contentSha256,
    );
  });
});

test('runner isolates file globals while executing every registered file', async () => {
  await fixture(
    "import { test } from 'bun:test'; test('sets global', () => { globalThis.pollution = true; });",
    async (root) => {
      const other = 'tests/unit/other.test.ts';
      await writeFile(
        resolve(root, other),
        "import { test, expect } from 'bun:test'; test('isolated', () => expect(globalThis.pollution).toBeUndefined());",
      );
      const result = await runSuite({
        root,
        entries: [...entries, { ...entries[0]!, file: other }],
        suite: 'local',
      });
      expect(result.exitCode, result.failure).toBe(0);
      expect(result.counts.pass).toBe(2);
    },
  );
});

test('runner permits ordinary data properties named only', async () => {
  await fixture(
    "import { test, expect } from 'bun:test'; const data = { only: 3 }; test('data property', () => expect(data.only).toBe(3));",
    async (root) => {
      const result = await runSuite({ root, entries, suite: 'local' });
      expect(result.exitCode, result.failure).toBe(0);
    },
  );
});

test.each([
  "import { test as verify } from 'bun:test'; verify.only('focused', () => {});",
  "import * as suite from 'bun:test'; suite.test.only('focused', () => {});",
  "import { test } from 'bun:test'; test['only']('focused', () => {});",
  "import { test } from 'bun:test'; test.each([1]).only('focused', () => {});",
])(
  'runner rejects Bun focus selection through aliases and chains: %s',
  async (body) => {
    await fixture(body, async (root) => {
      const result = await runSuite({ root, entries, suite: 'local' });
      expect(result.exitCode).toBe(1);
      expect(result.failure).toContain('Focused selection');
    });
  },
);

test('runner rejects focus captured through a local registration alias', async () => {
  await fixture(
    "import {test,expect} from 'bun:test'; const alias = test; alias.only('selected',()=>expect(1).toBe(1)); test('required',()=>expect(1).toBe(2));",
    async (root) => {
      const result = await runSuite({ root, entries, suite: 'local' });
      expect(result.exitCode).toBe(1);
    },
  );
});

test('runtime selection ledger catches dynamically selected focus even when the exception is caught', async () => {
  await fixture(
    "import {test,expect} from 'bun:test'; const method = ['on','ly'].join(''); try { test[method]('selected',()=>{}); } catch {} test('required',()=>expect(1).toBe(1));",
    async (root) => {
      const result = await runSuite({ root, entries, suite: 'local' });
      expect(result.exitCode).toBe(1);
    },
  );
});

test('selection guard preserves every normal parameterized registration', async () => {
  await fixture(
    "import {test,expect} from 'bun:test'; test.each([1,2])('row %i',(value)=>expect(value>0).toBe(true));",
    async (root) => {
      const result = await runSuite({ root, entries, suite: 'local' });
      expect(result.exitCode, result.failure).toBe(0);
      expect(result.counts).toEqual({ pass: 2, fail: 0, skip: 0 });
    },
  );
});
