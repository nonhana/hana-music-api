import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

for (const control of [
  { name: 'accepts the approved prerelease', accepted: true },
  { name: 'rejects wrong version', version: '4.0.0', accepted: false },
  { name: 'rejects wrong tag', tag: 'latest', accepted: false },
  { name: 'rejects unversioned changesets', active: true, accepted: false },
  { name: 'rejects wrong tarball digest', hash: 'unapproved', accepted: false },
]) {
  test(`candidate publication guard ${control.name}`, async () => {
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
    const guard = workflow.jobs.release.steps.find(
      (step: unknown) =>
        isRecord(step) && step.name === 'Check approved candidate',
    );
    if (!isRecord(guard) || typeof guard.run !== 'string')
      throw new Error('missing candidate guard');
    const temporary = await mkdtemp(resolve(tmpdir(), 'hana-candidate-guard-'));
    try {
      await mkdir(resolve(temporary, '.changeset'));
      await mkdir(resolve(temporary, '.artifacts/testing/ci'), {
        recursive: true,
      });
      await mkdir(resolve(temporary, 'bin'));
      await writeFile(
        resolve(temporary, 'package.json'),
        JSON.stringify({
          version: control.version ?? '4.0.0-next.0',
          publishConfig: { provenance: true },
        }),
      );
      await writeFile(
        resolve(temporary, '.changeset/pre.json'),
        JSON.stringify({ mode: 'pre', tag: control.tag ?? 'next' }),
      );
      if (control.active)
        await writeFile(
          resolve(temporary, '.changeset/active.md'),
          'unversioned',
        );
      const archive = 'isolated candidate archive';
      await writeFile(
        resolve(temporary, '.artifacts/testing/ci/control.tgz'),
        archive,
      );
      const npm = resolve(temporary, 'bin/npm');
      await writeFile(
        npm,
        '#!/bin/sh\nprintf \'[{"filename":"control.tgz","integrity":"control-integrity"}]\'\n',
      );
      await chmod(npm, 0o755);
      const child = Bun.spawn(
        ['bash', '--noprofile', '--norc', '-eo', 'pipefail', '-c', guard.run],
        {
          cwd: temporary,
          env: {
            ...process.env,
            PATH: `${resolve(temporary, 'bin')}:${process.env.PATH}`,
            HANA_CANDIDATE_VERSION: '4.0.0-next.0',
            HANA_CANDIDATE_SHA256:
              control.hash ??
              createHash('sha256').update(archive).digest('hex'),
          },
          stdout: 'pipe',
          stderr: 'pipe',
        },
      );
      const exitCode = await child.exited;
      const output =
        (await new Response(child.stdout).text()) +
        (await new Response(child.stderr).text());
      if (control.accepted) {
        expect(exitCode, output).toBe(0);
        expect(
          await Bun.file(
            resolve(temporary, '.artifacts/testing/ci/approved-package.json'),
          ).json(),
        ).toMatchObject({ version: '4.0.0-next.0', tag: 'next' });
      } else {
        expect(exitCode, output).not.toBe(0);
        expect(output).toContain(
          control.hash
            ? 'candidate tarball differs from approved hash'
            : 'candidate version, tag or Changesets state is not approved',
        );
      }
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
}

test('candidate publication suppresses GitHub releases and tag pushes while preserving checked publishing', async () => {
  const workflow = Bun.YAML.parse(
    await readFile(
      resolve(projectRoot, '.github/workflows/release.yml'),
      'utf8',
    ),
  ) as {
    jobs: {
      release: {
        steps: Array<{ uses?: string; with?: Record<string, unknown> }>;
      };
    };
  };
  const action = workflow.jobs.release.steps.find(
    (step) => step.uses === 'changesets/action@v2.1.2',
  )!;
  expect(action.with?.['publish-script']).toBe('bun run release:checked');
  expect(action.with?.['create-github-releases']).toBe(
    "${{ inputs.mode != 'candidate' }}",
  );
  expect(action.with?.['push-git-tags']).toBe(
    "${{ inputs.mode != 'candidate' }}",
  );
});

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

test.each(['verify', 'live', 'mutation', 'release', 'release-rehearsal'])(
  'CI %s preserves both a failed gate exit and its output',
  async (name) => {
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
        if (!isRecord(job)) throw new Error('invalid job');
        if (typeof job.uses === 'string') continue;
        if (!Array.isArray(job.steps)) throw new Error('invalid job');
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
  },
);

test('CI artifact probe runs a real failing assertion and preserves native JUnit and output', async () => {
  const workflow: unknown = Bun.YAML.parse(
    await readFile(
      resolve(projectRoot, '.github/workflows/verify.yml'),
      'utf8',
    ),
  );
  if (
    !isRecord(workflow) ||
    !isRecord(workflow.jobs) ||
    !isRecord(workflow.jobs.verify) ||
    !Array.isArray(workflow.jobs.verify.steps)
  )
    throw new Error('invalid verify workflow');
  const step: unknown = workflow.jobs.verify.steps.find(
    (entry: unknown) =>
      isRecord(entry) &&
      entry.name ===
        'Exercise artifact upload after an intentional test failure',
  );
  if (!isRecord(step) || typeof step.run !== 'string')
    throw new Error('missing executable artifact failure probe');
  const temporary = await mkdtemp(resolve(tmpdir(), 'hana-artifact-probe-'));
  try {
    const child = Bun.spawn(
      ['bash', '--noprofile', '--norc', '-eo', 'pipefail', '-c', step.run],
      { cwd: temporary, stdout: 'pipe', stderr: 'pipe' },
    );
    expect(await child.exited).toBe(1);
    const xml = await readFile(
      resolve(temporary, '.artifacts/testing/ci/failure-probe.xml'),
      'utf8',
    );
    const document = Bun.XML.parse(xml, { compact: false });
    expect(document.name).toBe('testsuites');
    expect(Number(document.attributes.tests)).toBe(1);
    expect(Number(document.attributes.failures)).toBe(1);
    expect(xml).toContain('intentional artifact upload failure');
    expect(xml).toContain('AssertionError');
    expect(
      await readFile(
        resolve(temporary, '.artifacts/testing/ci/failure-probe.log'),
        'utf8',
      ),
    ).toContain('intentional artifact upload failure');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
