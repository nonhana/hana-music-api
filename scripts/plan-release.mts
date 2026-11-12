import { appendFile } from 'node:fs/promises';

import { groups } from './mutation-test.mts';

const mode = process.env.MODE || 'publish';
const dry = mode === 'dry-run';
const approvedNext = mode === 'candidate';
if (!dry && !approvedNext && process.env.GITHUB_REF !== 'refs/heads/master')
  throw new Error('Stable publication requires master');
const pkg = Bun.file('package.json');
const { name, version, publishConfig } = await pkg.json();
if (name !== 'hana-music-api' || publishConfig?.provenance !== true)
  throw new Error('Unexpected release package');
const changesets = [
  ...new Bun.Glob('*.md').scanSync({ cwd: '.changeset' }),
].filter((path) => path !== 'README.md');
const pre = Bun.file('.changeset/pre.json');
let route: 'version' | 'candidate' | 'idle';
let patch = false;
if (dry) {
  if (!changesets.length && !(await pre.exists())) {
    const fixture = '.changeset/ci-rehearsal.md';
    await Bun.write(
      fixture,
      '---\nhana-music-api: patch\n---\n\nExercise version preparation.\n',
    );
    changesets.push(fixture);
  }
  if (
    changesets.length ||
    ((await pre.exists()) && (await pre.json()).mode === 'exit')
  ) {
    const child = Bun.spawn(['bun', 'run', 'version-packages'], {
      stdout: 'inherit',
      stderr: 'inherit',
    });
    if ((await child.exited) !== 0)
      throw new Error('Cannot prepare final version');
    patch = true;
  }
  route = 'candidate';
} else if (approvedNext) {
  if (
    changesets.length ||
    version !== process.env.APPROVED_VERSION ||
    !/^\d+\.\d+\.\d+-next\.\d+$/.test(version) ||
    !/^[a-f0-9]{64}$/.test(process.env.APPROVED_HASH ?? '')
  )
    throw new Error('Invalid candidate approval');
  route = 'candidate';
} else if (
  changesets.length ||
  ((await pre.exists()) && (await pre.json()).mode === 'exit')
) {
  route = 'version';
} else {
  if (!/^\d+\.\d+\.\d+$/.test(version) || (await pre.exists()))
    throw new Error('Expected a stable version');
  const parent = Bun.spawnSync(['git', 'show', 'HEAD^1:package.json']);
  if (parent.exitCode !== 0)
    throw new Error('Cannot identify the version commit');
  route =
    JSON.parse(parent.stdout.toString()).version === version
      ? 'idle'
      : 'candidate';
}
const final = await Bun.file('package.json').json();
await appendFile(
  process.env.GITHUB_OUTPUT!,
  `route=${route}\npatch=${patch}\nversion=${final.version}\ntargets=${JSON.stringify(groups)}\n`,
);
