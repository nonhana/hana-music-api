import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { fingerprint, writeEvidence } from '../tests/_kit/evidence.ts';
import { sealPackage } from './seal-release.mts';

const root = process.cwd();
const startedAt = new Date().toISOString();
const candidate = await fingerprint(root);
const directory = resolve(
  root,
  '.artifacts/testing/preflight',
  `${Date.now()}-${crypto.randomUUID()}`,
);
await mkdir(directory, { recursive: true });
const commands: Array<Array<string>> = [];
let exitCode = 1;
let failure: string | undefined;
let tarball: string | undefined;
let tarballSha256: string | undefined;
let files: Array<{ path: string; sha256: string }> = [];
try {
  for (const command of [
    ['bun', 'run', 'verify'],
    ['bun', 'run', 'verify:sdk'],
    ['bun', 'run', 'verify:fixtures'],
    ['bun', 'run', 'test:load:smoke'],
    ['bun', 'scripts/mutation-test.mts', '--all'],
    ['bun', 'run', 'test:live'],
  ]) {
    commands.push(command);
    const log = resolve(directory, `step-${commands.length}.log`);
    const child = Bun.spawn(command, {
      cwd: root,
      env: { ...process.env, LIVE_UPSTREAM: '1', HANA_LIVE_SUITE: 'anonymous' },
      stdout: Bun.file(log),
      stderr: Bun.file(`${log}.stderr`),
    });
    if ((await child.exited) !== 0)
      throw new Error(`preflight failed: ${command.join(' ')}`);
  }
  ({ tarball, tarballSha256, files } = await sealPackage(
    root,
    directory,
    startedAt,
    candidate,
    commands,
  ));
  exitCode = 0;
} catch (error) {
  failure = error instanceof Error ? error.message : 'preflight tool failure';
}
const report = await writeEvidence(
  {
    suite: 'preflight',
    command: [process.execPath, ...process.argv.slice(1)],
    startedAt,
    candidate,
    exitCode,
    counts: {
      pass: exitCode === 0 ? commands.length : 0,
      fail: exitCode === 0 ? 0 : 1,
      skip: 0,
    },
    artifacts: tarball ? { tarball } : {},
    details: { commands, failure, tarballSha256, files },
  },
  root,
  directory,
);
console.log(
  JSON.stringify({
    status: report.status,
    report: report.artifacts.summary,
    failure,
  }),
);
process.exitCode = exitCode;
