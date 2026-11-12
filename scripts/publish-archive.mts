import { createHash } from 'node:crypto';

const archive = '.artifacts/testing/ci/verified.tgz';
const bytes = await Bun.file(archive).bytes();
const digest = createHash('sha256').update(bytes).digest('hex');
if (digest !== process.env.EXPECTED_SHA256)
  throw new Error('Verified archive digest mismatch');
const embedded = Bun.spawnSync([
  'tar',
  '-xOzf',
  archive,
  'package/package.json',
]);
if (embedded.exitCode !== 0)
  throw new Error('Cannot read verified package metadata');
const pkg = JSON.parse(embedded.stdout.toString());
const mode = process.env.MODE;
const dry = mode === 'dry-run';
const next = /^\d+\.\d+\.\d+-next\.\d+$/.test(pkg.version);
if (
  !['publish', 'candidate', 'dry-run'].includes(mode ?? '') ||
  pkg.name !== 'hana-music-api' ||
  pkg.version !== process.env.EXPECTED_VERSION ||
  pkg.publishConfig?.provenance !== true ||
  (!next && !/^\d+\.\d+\.\d+$/.test(pkg.version)) ||
  (!dry && next !== (mode === 'candidate'))
)
  throw new Error('Unexpected archive name, version or publish mode');
console.log(`Verified ${pkg.name}@${pkg.version} SHA-256 ${digest}`);
const tag = next ? 'next' : 'latest';
const registry = 'https://registry.npmjs.org';
if (!dry) {
  const response = await fetch(`${registry}/hana-music-api/${pkg.version}`);
  if (response.ok) {
    const metadata = (await response.json()) as {
      dist?: { integrity?: string };
    };
    if (
      metadata.dist?.integrity !==
      'sha512-' + createHash('sha512').update(bytes).digest('base64')
    )
      throw new Error('Registry version contains other bytes');
    console.log('Registry already contains this verified archive');
    process.exit(0);
  }
  if (response.status !== 404)
    throw new Error(`Registry check failed: ${response.status}`);
  if (tag === 'latest') {
    const latest = await fetch(`${registry}/hana-music-api/latest`);
    if (!latest.ok)
      throw new Error(`Cannot verify latest dist-tag: ${latest.status}`);
    const metadata = (await latest.json()) as { version: string };
    if (
      !/^\d+\.\d+\.\d+$/.test(metadata.version) ||
      Bun.semver.order(pkg.version, metadata.version) <= 0
    )
      throw new Error('Refusing to move latest backwards');
  }
}
const child = Bun.spawn(
  [
    'npm',
    'publish',
    archive,
    '--ignore-scripts',
    '--access',
    'public',
    '--registry',
    registry,
    '--tag',
    tag,
    ...(dry ? ['--dry-run', '--provenance=false'] : ['--provenance']),
  ],
  { stdout: 'inherit', stderr: 'inherit' },
);
process.exitCode = await child.exited;
