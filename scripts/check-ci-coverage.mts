import { execFileSync } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { fingerprint } from '../tests/_kit/evidence.ts';
import { selectSuiteFiles, testEntries } from '../tests/suites.ts';

const root = resolve(process.argv[2]!);
const head = process.argv[3];
if (!head) throw new Error('Missing candidate commit');
const expected = new Set(
  ['local', 'sdk', 'smoke'].flatMap((suite) =>
    selectSuiteFiles(testEntries, suite),
  ),
);
const seen = new Set<string>();
let suiteFingerprint: string | undefined;
const checkout =
  process.env.GITHUB_EVENT_NAME === 'pull_request' ? await fingerprint() : null;
let cleanLanes = checkout?.head === head;
for (const lane of ['static', 'docs', 'source-a', 'source-b', 'package']) {
  const cwd = resolve(root, `testing-${head}-${lane}`);
  if ((await Bun.file(resolve(cwd, 'ci/completed')).text()).trim() !== head)
    throw new Error(`Missing completed lane for ${head}: ${lane}`);
  if (checkout && cleanLanes) {
    const initial = await Bun.file(resolve(cwd, 'ci/initial-candidate.json'))
      .json()
      .catch(() => null);
    const before = await Bun.file(resolve(cwd, 'ci/source-before'))
      .text()
      .catch(() => null);
    const after = await Bun.file(resolve(cwd, 'ci/source-after'))
      .text()
      .catch(() => null);
    cleanLanes =
      initial?.head === head &&
      initial.contentSha256 === checkout.contentSha256 &&
      before === '' &&
      after === '';
    if (!cleanLanes)
      console.log(
        `PR tree reuse unavailable: ${lane} checkout differs or lacks evidence`,
      );
  }
  const suites =
    lane === 'package'
      ? ['ci-package', 'ci-built']
      : lane.startsWith('source-')
        ? [`ci-${lane}`]
        : [];
  for (const suite of suites) {
    const paths = await Array.fromAsync(
      new Bun.Glob(`${suite}/*/summary.json`).scan({ cwd, absolute: true }),
    );
    if (paths.length !== 1)
      throw new Error(`Expected one summary for ${suite}`);
    const summary = await Bun.file(paths[0]!).json();
    if (
      summary.suite !== suite ||
      summary.status !== 'pass' ||
      summary.testedHead !== head ||
      !summary.candidate.contentSha256 ||
      (suiteFingerprint && summary.candidate.contentSha256 !== suiteFingerprint)
    )
      throw new Error(`Unverified suite: ${suite}`);
    suiteFingerprint = summary.candidate.contentSha256;
    for (const file of summary.details.files as Array<string>) {
      if (!expected.has(file) || seen.has(file))
        throw new Error(`Unexpected or duplicate: ${file}`);
      seen.add(file);
    }
  }
}
const missing = [...expected].filter((file) => !seen.has(file));
if (missing.length) throw new Error(`Missing CI tests: ${missing.join(', ')}`);
console.log(`Verified ${seen.size} distinct test files at ${head}`);
if (checkout && cleanLanes && suiteFingerprint === checkout.contentSha256) {
  const tree = execFileSync('git', ['rev-parse', `${head}^{tree}`], {
    encoding: 'utf8',
  }).trim();
  await appendFile(process.env.GITHUB_OUTPUT!, `tree=${tree}\n`);
}
