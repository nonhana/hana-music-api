import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const repoRoot = resolve(import.meta.dir, '../..');
const auditScript = join(repoRoot, 'scripts/schema-audit.mts');

const writeJson = async (path: string, value: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value));
};

const writeGzip = async (path: string, value: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, gzipSync(JSON.stringify(value)));
};

const recording = (
  module: string,
  body: unknown,
  status = 200,
  context?: Record<string, unknown>,
) => ({
  module,
  query: {},
  ...(context === undefined ? {} : { context }),
  response: { status, body },
});

const audit = (...args: Array<string>) => {
  const result = Bun.spawnSync(['bun', auditScript, ...args], {
    cwd: repoRoot,
    stderr: 'pipe',
    stdout: 'pipe',
  });
  return {
    code: result.exitCode,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString(),
  };
};

test('audit scans nested json and json.gz recordings with derived outcomes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hana-schema-audit-'));
  try {
    await writeJson(
      join(root, 'nested/shell.json'),
      recording('shell_module', {
        body: { code: 200, count: 1 },
        cookie: [],
        status: 200,
      }),
    );
    await writeJson(
      join(root, 'nested/no-code.json'),
      recording('no_code_module', { fileName: 'x' }),
    );
    await writeJson(
      join(root, 'nested/data-code-200.json'),
      recording('data_module', { data: { code: 200, account: { id: 1 } } }),
    );
    await writeJson(
      join(root, 'nested/data-business-code.json'),
      recording('data_business_module', { data: { code: 300 } }),
    );
    await writeJson(
      join(root, 'nested/status-500.json'),
      recording('status_module', { code: 200 }, 500),
    );
    await writeJson(
      join(root, 'nested/code-404.json'),
      recording('code_module', { code: 404 }),
    );
    await writeJson(
      join(root, 'nested/code-string.json'),
      recording('string_code_module', { code: '200' }),
    );
    await writeJson(
      join(root, 'nested/index.json'),
      recording('index_module', { code: 200 }),
    );
    await writeJson(join(root, 'orphan.json'), {
      query: {},
      response: { status: 200, body: { code: 200 } },
    });
    await writeGzip(
      join(root, 'deeply/nested/gz/compressed.json.gz'),
      recording('gz_module', { code: 200, items: [1] }),
    );
    await writeJson(
      join(root, 'nested/index.json.gz'),
      recording('index_gz_module', { code: 200 }),
    );
    await writeJson(
      join(root, 'nested/context-rejected.json'),
      recording('context_rejected_module', { code: 200 }, 200, {
        outcome: 'rejected',
      }),
    );
    await writeJson(
      join(root, 'nested/context-ok.json'),
      recording('context_ok_module', { code: 800 }, 200, { outcome: 'ok' }),
    );
    await writeJson(
      join(root, 'nested/data-code-string.json'),
      recording('data_string_code_module', { data: { code: '300' } }),
    );
    await writeJson(
      join(root, 'nested/data-code-null.json'),
      recording('data_null_code_module', { data: { code: null } }),
    );
    await writeJson(
      join(root, 'nested/multi-part.1.json'),
      recording('multi_part_module', { code: 200, playlist: {} }, 200, {
        part: { index: 1, of: 2, final: false },
      }),
    );
    await writeJson(
      join(root, 'nested/multi-part.2.json'),
      recording('multi_part_module', { code: 200, songs: [] }, 200, {
        part: { index: 2, of: 2, final: true },
      }),
    );

    const result = audit('recordings', root);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(
      'recordings: 11 ok entries (10 eligible, 1 multi-part excluded)\n',
    );
    expect(result.stdout).toContain('  scanned: 15 files\n');
    expect(result.stdout).toContain('  ok: 11\n');
    expect(result.stdout).toContain('  rejected: 3\n');
    expect(result.stdout).toContain('  multi-part: 1 (excluded)\n');
    expect(result.stdout).toContain('  no-module: 1\n');
    expect(result.stdout).toContain('  validated: 0\n');
    expect(result.stdout).toContain('  failures: 0\n');

    const shell = audit('module', 'shell_module', '--recordings', root);
    expect(shell.code).toBe(0);
    expect(shell.stdout).toContain(
      'module: shell_module\nrecordings: 1\n  ok: 1\npath\ttypes\tcount\tsamples\ncode\tnumber\t1\t200\ncount\tnumber\t1\t1\n',
    );

    const gzip = audit('module', 'gz_module', '--recordings', root);
    expect(gzip.code).toBe(0);
    expect(gzip.stdout).toContain(
      'code\tnumber\t1\t200\nitems[]\tnumber\t1\t1\n',
    );

    const contextOk = audit(
      'module',
      'context_ok_module',
      '--recordings',
      root,
    );
    expect(contextOk.code).toBe(0);
    expect(contextOk.stdout).toContain(
      'module: context_ok_module\nrecordings: 1\n  ok: 1\n',
    );
    expect(contextOk.stdout).toContain('code\tnumber\t1\t800\n');

    const contextRejected = audit(
      'module',
      'context_rejected_module',
      '--recordings',
      root,
    );
    expect(contextRejected.code).toBe(1);
    expect(contextRejected.stderr).toContain('没有 final:true 的成功录制');

    const multiPart = audit(
      'module',
      'multi_part_module',
      '--recordings',
      root,
    );
    expect(multiPart.code).toBe(0);
    expect(multiPart.stdout).toContain('multi-part: 1 (excluded)\n');
    expect(multiPart.stdout).toContain('code\tnumber\t1\t200\n');
    expect(multiPart.stdout).toContain('songs\tarray(empty)\t1\t[]\n');
    expect(multiPart.stdout).not.toContain('playlist.');

    const stringDataCode = audit(
      'module',
      'data_string_code_module',
      '--recordings',
      root,
    );
    expect(stringDataCode.code).toBe(0);

    const nullDataCode = audit(
      'module',
      'data_null_code_module',
      '--recordings',
      root,
    );
    expect(nullDataCode.code).toBe(0);

    const rejected = audit('module', 'status_module', '--recordings', root);
    expect(rejected.code).toBe(1);
    expect(rejected.stderr).toContain('没有 final:true 的成功录制');

    const orphan = audit('module', 'orphan_module', '--recordings', root);
    expect(orphan.code).toBe(1);

    const skippedIndex = audit('module', 'index_module', '--recordings', root);
    expect(skippedIndex.code).toBe(1);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test('audit does not count a module as covered when only non-final parts exist', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hana-schema-audit-partial-'));
  try {
    await writeJson(
      join(root, 'login/partial.json'),
      recording('login_qr_check', { code: 800, message: 'partial' }, 200, {
        part: { index: 1, of: 2, final: false },
      }),
    );

    const result = audit('recordings', root, '--list');
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('  multi-part: 1 (excluded)\n');
    expect(result.stdout).toContain('  validated: 0\n');
    expect(result.stdout).toContain(
      '  body modules without auditable recordings:',
    );
    expect(result.stdout).toContain('    login_qr_check\n');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test('index mode reports unreadable recordings with the path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hana-schema-audit-missing-'));
  try {
    await writeJson(join(root, 'index.json'), {
      entries: [
        { module: 'login_qr_check', path: 'missing.json', outcome: 'ok' },
      ],
    });

    const result = audit('recordings', root);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('读取索引录制 missing.json 失败');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test('audit derives final parts from index recordings and validates only final', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hana-schema-audit-index-'));
  try {
    await writeJson(
      join(root, 'login/final.json'),
      recording('login_qr_check', { code: 800, message: 'ok' }, 200, {
        part: { index: 2, of: 2, final: true },
      }),
    );
    await writeJson(
      join(root, 'login/partial.json'),
      recording('login_qr_check', { code: 800, message: 'partial' }, 200, {
        part: { index: 1, of: 2, final: false },
      }),
    );
    await writeJson(
      join(root, 'bad.json'),
      recording('bad_module', { code: 404 }),
    );
    await writeJson(
      join(root, 'rate.json'),
      recording('rate_module', { code: 429 }),
    );
    await writeJson(join(root, 'index.json'), {
      entries: [
        { module: 'login_qr_check', path: 'login/final.json', outcome: 'ok' },
        {
          module: 'login_qr_check',
          path: 'login/partial.json',
          outcome: 'ok',
        },
        { module: 'bad_module', path: 'bad.json', outcome: 'rejected' },
        { module: 'rate_module', path: 'rate.json', outcome: 'rateLimited' },
        { path: 'orphan.json', outcome: 'ok' },
      ],
    });

    const result = audit('recordings', root);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(
      'recordings: 2 ok entries (1 eligible, 1 multi-part excluded)\n',
    );
    expect(result.stdout).toContain('  scanned: 5 entries\n');
    expect(result.stdout).toContain('  ok: 2\n');
    expect(result.stdout).toContain('  rejected: 1\n');
    expect(result.stdout).toContain('  rateLimited: 1\n');
    expect(result.stdout).toContain('  multi-part: 1 (excluded)\n');
    expect(result.stdout).toContain('  no-module: 1\n');
    expect(result.stdout).toContain('  validated: 1\n');
    expect(result.stdout).toContain('  failures: 0\n');

    const matrix = audit('module', 'login_qr_check', '--recordings', root);
    expect(matrix.code).toBe(0);
    expect(matrix.stdout).toContain('multi-part: 1 (excluded)\n');
    expect(matrix.stdout).toContain('code\tnumber\t1\t800\n');
    expect(matrix.stdout).toContain('message\tstring\t1\t"ok"\n');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test('audit validates context.expect instead of the raw response body', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hana-schema-audit-expect-'));
  try {
    await writeJson(
      join(root, 'login/expect.json'),
      recording('login_qr_check', { code: 200, message: 'raw' }, 200, {
        expect: { code: 800, message: 'expected' },
      }),
    );

    const result = audit('recordings', root);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('  validated: 1\n');
    expect(result.stdout).toContain('  failures: 0\n');

    const matrix = audit('module', 'login_qr_check', '--recordings', root);
    expect(matrix.code).toBe(0);
    expect(matrix.stdout).toContain('code\tnumber\t1\t800\n');
    expect(matrix.stdout).toContain('message\tstring\t1\t"expected"\n');
    expect(matrix.stdout).not.toContain('"raw"');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
