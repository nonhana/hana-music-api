import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { isRecord } from '../../../src/core/utils.ts';
import { projectRoot } from '../../_kit/assertions.ts';

const exercise = async (failure: string | undefined) => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'hana-preflight-'));
  const root = resolve(temporary, 'project');
  const bin = resolve(temporary, 'bin');
  const trace = resolve(temporary, 'trace.jsonl');
  try {
    await mkdir(resolve(root, 'dist'), { recursive: true });
    await mkdir(bin);
    await writeFile(resolve(root, '.gitignore'), 'dist\n.artifacts\n');
    const manifest = JSON.parse(
      await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };
    await writeFile(
      resolve(root, 'package.json'),
      JSON.stringify({
        name: 'preflight-control',
        version: '1.0.0',
        scripts: { 'release:checked': manifest.scripts['release:checked'] },
      }),
    );
    await writeFile(resolve(root, 'dist/index.js'), 'export const value = 1;');
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Control',
        '-c',
        'user.email=control@example.invalid',
        '-c',
        'commit.gpgSign=false',
        'commit',
        '-qm',
        'control',
      ],
      { cwd: root },
    );
    const probe = resolve(temporary, 'probe.mjs');
    await writeFile(
      probe,
      `
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fingerprint } from ${JSON.stringify(resolve(projectRoot, 'tests/_kit/evidence.ts'))};
const args = process.argv.slice(2);
await appendFile(process.env.HANA_CONTROL_TRACE, JSON.stringify(args) + '\\n');
const key = args.includes('scripts/mutation-test.mts') ? 'mutation' : args[2];
if (key === process.env.HANA_CONTROL_FAILURE) process.exit(7);
const root = process.cwd();
const folder = resolve(root, '.artifacts/testing/package/control');
if (key === 'verify:sdk') {
  await mkdir(folder, { recursive: true });
  const tarball = resolve(folder, 'control.tgz'); await writeFile(tarball, 'control');
  const files = await Promise.all(['package.json', 'dist/index.js'].map(async (path) => ({ path, sha256: createHash('sha256').update(await readFile(resolve(root,path))).digest('hex') })));
  await writeFile(resolve(folder,'summary.json'), JSON.stringify({ status: 'pass', endedAt: new Date().toISOString(), candidate: await fingerprint(root), artifacts: { tarball }, details: { tarballSha256: createHash('sha256').update('control').digest('hex'), files } }));
}
if (key === 'test:live') {
  const packaged = JSON.parse(await readFile(resolve(folder,'summary.json'),'utf8'));
  const directory = resolve(root,'.artifacts/testing/live/control'); await mkdir(directory, {recursive:true});
  await writeFile(resolve(directory,'summary.json'),JSON.stringify({ status:'pass', endedAt: new Date().toISOString(), candidate: await fingerprint(root), details:{tarballSha256:packaged.details.tarballSha256, live:{identityClass:'anonymous'}} }));
  if (process.env.HANA_CONTROL_FAILURE === 'changed-dist') await writeFile(resolve(root,'dist/index.js'),'changed');
  if (process.env.HANA_CONTROL_FAILURE === 'extra-dist') await writeFile(resolve(root,'dist/extra.js'),'extra');
  if (process.env.HANA_CONTROL_FAILURE === 'changed-source') await writeFile(resolve(root,'package.json'),'{}');
}
if (args[0] === 'npm') {
  const files = ['package.json','dist/index.js', ...(process.env.HANA_CONTROL_FAILURE === 'extra-dist' ? ['dist/extra.js'] : [])].map((path)=>({path}));
  console.log(JSON.stringify([{files}]));
}
`,
    );
    for (const name of ['bun', 'npm']) {
      const path = resolve(bin, name);
      await writeFile(
        path,
        `#!/bin/sh\nif [ "$1" = "scripts/release-preflight.mts" ]; then exec "$HANA_CONTROL_BUN" "$HANA_CONTROL_PREFLIGHT"; fi\nexec "$HANA_CONTROL_BUN" "$HANA_CONTROL_PROBE" ${name} "$@"\n`,
      );
      await chmod(path, 0o755);
    }
    const workflow: unknown = Bun.YAML.parse(
      await readFile(
        resolve(projectRoot, '.github/workflows/release.yml'),
        'utf8',
      ),
    );
    if (
      !isRecord(workflow) ||
      !isRecord(workflow.jobs) ||
      !isRecord(workflow.jobs.release) ||
      !Array.isArray(workflow.jobs.release.steps)
    )
      throw new Error('invalid release workflow');
    const publish = workflow.jobs.release.steps.find(
      (step: unknown) =>
        isRecord(step) &&
        isRecord(step.with) &&
        typeof step.with['publish-script'] === 'string',
    );
    if (
      !isRecord(publish) ||
      !isRecord(publish.with) ||
      typeof publish.with['publish-script'] !== 'string'
    )
      throw new Error('missing action publish command');
    // The Action passes a command and argv to spawn, so this fixture must not add an outer shell.
    const command = publish.with['publish-script'].split(' ');
    if (command[0] !== 'bun') throw new Error('unsupported publish executable');
    command[0] = process.execPath;
    const child = Bun.spawn(command, {
      cwd: root,
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        HANA_CONTROL_BUN: process.execPath,
        HANA_CONTROL_PROBE: probe,
        HANA_CONTROL_PREFLIGHT: resolve(
          projectRoot,
          'scripts/release-preflight.mts',
        ),
        HANA_CONTROL_TRACE: trace,
        HANA_CONTROL_FAILURE: failure,
      },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exitCode = await child.exited;
    const stdout = await new Response(child.stdout).text();
    const stderr = await new Response(child.stderr).text();
    const calls: Array<Array<string>> = (await readFile(trace, 'utf8'))
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    return { exitCode, stdout, stderr, calls };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
};

test('preflight runs every final gate, compares the current package manifest and only then permits release', async () => {
  const result = await exercise(undefined);
  expect(result.exitCode, result.stderr + result.stdout).toBe(0);
  expect(result.calls).toEqual([
    ['bun', 'run', 'verify'],
    ['bun', 'run', 'verify:sdk'],
    ['bun', 'run', 'verify:fixtures'],
    ['bun', 'run', 'test:load:smoke'],
    ['bun', 'run', 'test:load:soak'],
    ['bun', 'scripts/mutation-test.mts', '--all'],
    ['bun', 'run', 'test:live'],
    ['npm', 'pack', '--dry-run', '--json', '--ignore-scripts'],
    ['bun', 'run', 'release'],
  ]);
}, 15_000);

test.each([
  'verify',
  'verify:sdk',
  'verify:fixtures',
  'test:load:smoke',
  'test:load:soak',
  'mutation',
  'test:live',
  'changed-dist',
  'extra-dist',
  'changed-source',
])(
  'preflight failure %s prevents every release invocation',
  async (failure) => {
    const result = await exercise(failure);
    expect(result.exitCode, result.stderr + result.stdout).not.toBe(0);
    expect(result.calls.filter((call) => call[2] === 'release')).toHaveLength(
      0,
    );
  },
  15_000,
);

test.each([
  'verify',
  'load',
  'live',
  'mutation',
  'release',
  'release-rehearsal',
])('CI %s preserves both a failed gate exit and its output', async (name) => {
  const workflow: unknown = Bun.YAML.parse(
    await readFile(
      resolve(projectRoot, `.github/workflows/${name}.yml`),
      'utf8',
    ),
  );
  if (!isRecord(workflow) || !isRecord(workflow.jobs))
    throw new Error('invalid workflow');
  const temporary = await mkdtemp(resolve(tmpdir(), 'hana-ci-failure-'));
  try {
    const bin = resolve(temporary, 'bin');
    await mkdir(bin);
    await mkdir(resolve(temporary, '.artifacts/testing/ci'), {
      recursive: true,
    });
    const probe = resolve(bin, 'bun');
    await writeFile(
      probe,
      '#!/bin/sh\nprintf "forced gate failure\\n"\nexit 7\n',
    );
    await chmod(probe, 0o755);
    let checked = 0;
    for (const job of Object.values(workflow.jobs)) {
      if (!isRecord(job) || !Array.isArray(job.steps))
        throw new Error('invalid job');
      const defaults = isRecord(job.defaults)
        ? job.defaults
        : workflow.defaults;
      const run = isRecord(defaults) ? defaults.run : undefined;
      for (const step of job.steps) {
        if (
          !isRecord(step) ||
          typeof step.run !== 'string' ||
          !step.run.includes('| tee')
        )
          continue;
        const shell = step.shell ?? (isRecord(run) ? run.shell : undefined);
        // cspell:ignore noprofile norc pipefail
        const args =
          shell === 'bash'
            ? ['--noprofile', '--norc', '-eo', 'pipefail']
            : ['-e'];
        const child = Bun.spawn(['bash', ...args, '-c', step.run], {
          cwd: temporary,
          env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
          stdout: 'pipe',
          stderr: 'pipe',
        });
        expect(await child.exited, `${name}: ${step.run}`).toBe(7);
        expect(await new Response(child.stdout).text()).toContain(
          'forced gate failure',
        );
        const logs = await Array.fromAsync(
          new Bun.Glob('.artifacts/testing/ci/*.log').scan({
            cwd: temporary,
            absolute: true,
          }),
        );
        expect(logs.length).toBeGreaterThan(0);
        expect(await readFile(logs.at(-1)!, 'utf8')).toContain(
          'forced gate failure',
        );
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
