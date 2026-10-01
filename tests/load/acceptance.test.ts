import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { assertLoadReport, fingerprint } from '../../scripts/load-test.mts';

const healthy = {
  requests: 202,
  p95: 50,
  rejectedP95: 10,
  successes: 100,
  rejected: 100,
  cancelled: 1,
  timedOut: 1,
  normalSuccesses: 80,
  fastRejected: 50,
  pressureRejected: 50,
  pressureMaxMs: 2_050,
  active: 0,
  waiting: 0,
  upstreamActive: 0,
  inflight: 0,
  peakInflight: 8,
  peakActive: 8,
  peakWaiting: 32,
  rssGrowth: 0.1,
};

test('load acceptance accepts a measured healthy run', () => {
  expect(() => assertLoadReport(healthy)).not.toThrow();
});

test.each([
  { p95: 1_000 },
  { rejectedP95: 250 },
  { successes: 0 },
  { rejected: 0 },
  { requests: 203 },
  { normalSuccesses: 0 },
  { fastRejected: 51 },
  { pressureRejected: 0 },
  { pressureMaxMs: 2_501 },
  { active: 1 },
  { waiting: 1 },
  { upstreamActive: 1 },
  { inflight: 1 },
  { peakInflight: 0 },
  { peakActive: 9 },
  { peakWaiting: 33 },
  { rssGrowth: 0.31 },
  { p95: Number.NaN },
])('load acceptance rejects a violated contract: %j', (violation) => {
  expect(() => assertLoadReport({ ...healthy, ...violation })).toThrow();
});

test('load fingerprint includes a tracked diff larger than the default process buffer', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'hana-load-fingerprint-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: directory });
    await writeFile(resolve(directory, 'tracked.txt'), 'initial\n');
    execFileSync('git', ['add', 'tracked.txt'], { cwd: directory });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.com',
        'commit',
        '-qm',
        'initial',
      ],
      {
        cwd: directory,
      },
    );
    await writeFile(
      resolve(directory, 'tracked.txt'),
      'changed\n'.repeat(170_000),
    );
    const diff = execFileSync('git', ['diff', 'HEAD', '--binary'], {
      cwd: directory,
      maxBuffer: 4 * 1024 * 1024,
    });
    expect(diff.byteLength).toBeGreaterThan(1024 * 1024);
    const result = await fingerprint(directory);
    expect(result.diffSha256).toBe(
      createHash('sha256').update(diff).digest('hex'),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
