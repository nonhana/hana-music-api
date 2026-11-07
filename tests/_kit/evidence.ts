import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { assertNoLeaks, redact } from '../../scripts/lib/redaction.ts';

const excluded = (path: string) =>
  path.startsWith('.artifacts/testing/') ||
  path.startsWith('docs/acceptance/runs/');

export const fingerprint = async (cwd = process.cwd()) => {
  const git = (args: Array<string>) =>
    execFileSync('git', args, { cwd, maxBuffer: 32 * 1024 * 1024 });
  const head = git(['rev-parse', 'HEAD']).toString().trim();

  const files = [
    ...new Set(
      git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
        .toString()
        .split('\0')
        .filter(Boolean),
    ),
  ]
    .filter((entry) => !excluded(entry))
    .toSorted();
  const content = createHash('sha256');
  for (const path of files) {
    const absolute = resolve(cwd, path);
    const metadata = await lstat(absolute).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return undefined;
        throw error;
      },
    );
    if (!metadata) continue;
    content
      .update(path)
      .update('\0')
      .update(String(metadata.mode & 0o777))
      .update('\0');
    content
      .update(
        metadata.isSymbolicLink()
          ? await readlink(absolute)
          : await readFile(absolute),
      )
      .update('\0');
  }
  const diff = createHash('sha256').update(
    git([
      'diff',
      'HEAD',
      '--binary',
      '--',
      '.',
      ':!.artifacts/testing',
      ':!docs/acceptance/runs',
    ]),
  );
  for (const path of git(['ls-files', '--others', '--exclude-standard', '-z'])
    .toString()
    .split('\0')
    .filter(Boolean)
    .filter((entry) => !excluded(entry))
    .toSorted()) {
    diff
      .update(path)
      .update('\0')
      .update(await readFile(resolve(cwd, path)));
  }
  return {
    head,
    contentSha256: content.digest('hex'),
    diffSha256: diff.digest('hex'),
  };
};

export const writeEvidence = async (
  input: {
    suite: string;
    command: Array<string>;
    startedAt: string;
    exitCode: number;
    counts: { pass: number; fail: number; skip: number };
    candidate: Awaited<ReturnType<typeof fingerprint>>;
    details?: unknown;
    artifacts?: Record<string, string>;
  },
  root = process.cwd(),
  directory = resolve(root, '.artifacts/testing', input.suite),
) => {
  await mkdir(directory, { recursive: true });
  const summary = resolve(directory, 'summary.json');
  const lockfile = await readFile(resolve(root, 'bun.lock')).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    },
  );
  const report = {
    schemaVersion: 1,
    ...input,
    testedHead: input.candidate.head,
    status: input.exitCode === 0 ? 'pass' : 'fail',
    endedAt: new Date().toISOString(),
    bunVersion: Bun.version,
    nodeVersion: execFileSync('node', ['--version'], {
      encoding: 'utf8',
    }).trim(),
    lockfileSha256: lockfile
      ? createHash('sha256').update(lockfile).digest('hex')
      : null,
    artifacts: { ...input.artifacts, summary },
  };
  const safeReport = redact(report, 'evidence');
  assertNoLeaks(safeReport, 'evidence');
  await writeFile(summary, JSON.stringify(safeReport, null, 2) + '\n');
  return report;
};
