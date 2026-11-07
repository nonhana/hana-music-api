import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { fingerprint, writeEvidence } from '../tests/_kit/evidence.ts';

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
    ['bun', 'run', 'test:load:soak'],
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
  const reports = await Promise.all(
    (
      await Array.fromAsync(
        new Bun.Glob('.artifacts/testing/package/*/summary.json').scan({
          cwd: root,
          absolute: true,
        }),
      )
    ).map(
      async (path) =>
        JSON.parse(await readFile(path, 'utf8')) as {
          status: string;
          endedAt: string;
          candidate: { contentSha256: string };
          artifacts: { tarball: string };
          details: {
            tarballSha256: string;
            files: Array<{ path: string; sha256: string }>;
          };
        },
    ),
  );
  const packaged = reports
    .filter(
      (report) =>
        report.status === 'pass' &&
        report.endedAt >= startedAt &&
        report.candidate.contentSha256 === candidate.contentSha256,
    )
    .toSorted((left, right) => right.endedAt.localeCompare(left.endedAt))[0];
  if (!packaged) throw new Error('missing final candidate package evidence');
  tarball = packaged.artifacts.tarball;
  tarballSha256 = createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex');
  files = packaged.details.files;
  if (tarballSha256 !== packaged.details.tarballSha256 || !files.length)
    throw new Error('candidate tarball changed or manifest empty');
  const manifestCommand = [
    'npm',
    'pack',
    '--dry-run',
    '--json',
    '--ignore-scripts',
  ];
  commands.push(manifestCommand);
  const manifestProcess = Bun.spawn(manifestCommand, {
    cwd: root,
    stdout: 'pipe',
    stderr: Bun.file(resolve(directory, 'package-manifest.stderr')),
  });
  const manifestText = await new Response(manifestProcess.stdout).text();
  if ((await manifestProcess.exited) !== 0)
    throw new Error('cannot inspect final package manifest');
  const packed: Array<{ files: Array<{ path: string }> }> =
    JSON.parse(manifestText);
  const actualPaths = packed[0]?.files.map((file) => file.path).toSorted();
  if (
    !actualPaths ||
    JSON.stringify(actualPaths) !==
      JSON.stringify(files.map((file) => file.path).toSorted())
  )
    throw new Error('final package file set changed');
  await Bun.write(resolve(directory, 'package-manifest.json'), manifestText);
  for (const file of files) {
    if (
      createHash('sha256')
        .update(await readFile(resolve(root, file.path)))
        .digest('hex') !== file.sha256
    )
      throw new Error(`candidate package changed: ${file.path}`);
  }
  const liveReports = await Promise.all(
    (
      await Array.fromAsync(
        new Bun.Glob('.artifacts/testing/live/*/summary.json').scan({
          cwd: root,
          absolute: true,
        }),
      )
    ).map(
      async (path) =>
        JSON.parse(await readFile(path, 'utf8')) as {
          status: string;
          endedAt: string;
          candidate: { contentSha256: string };
          details: { tarballSha256: string; live?: { identityClass: string } };
        },
    ),
  );
  if (
    !liveReports.some(
      (report) =>
        report.status === 'pass' &&
        report.endedAt >= startedAt &&
        report.candidate.contentSha256 === candidate.contentSha256 &&
        report.details.tarballSha256 === tarballSha256 &&
        report.details.live?.identityClass === 'anonymous',
    )
  )
    throw new Error('anonymous live does not match the final tarball');
  if ((await fingerprint(root)).contentSha256 !== candidate.contentSha256)
    throw new Error('source candidate changed during preflight');
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
