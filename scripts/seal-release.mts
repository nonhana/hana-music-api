import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { fingerprint } from '../tests/_kit/evidence.ts';

export const sealPackage = async (
  root: string,
  directory: string,
  startedAt: string,
  candidate: Awaited<ReturnType<typeof fingerprint>>,
  commands: Array<Array<string>>,
) => {
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
  const tarball = packaged.artifacts.tarball;
  const tarballSha256 = createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex');
  const files = packaged.details.files;
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
  const packed: Array<{ files: Array<{ path: string }> }> = Object.values(
    JSON.parse(manifestText),
  );
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
  return { tarball, tarballSha256, files };
};

if (import.meta.main) {
  const directory = resolve('.artifacts/testing/release');
  await mkdir(directory, { recursive: true });
  const initial = await Bun.file(
    '.artifacts/testing/ci/initial-candidate.json',
  ).json();
  const sealed = await sealPackage(process.cwd(), directory, '', initial, []);
  await copyFile(sealed.tarball, resolve(directory, 'verified.tgz'));
  await Bun.write(resolve(directory, 'sha256'), sealed.tarballSha256);
}
