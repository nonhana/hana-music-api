import { resolve } from 'node:path';

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
let fingerprint: string | undefined;
for (const lane of ['static', 'docs', 'source-a', 'source-b', 'package']) {
  const cwd = resolve(root, `testing-${head}-${lane}`);
  if ((await Bun.file(resolve(cwd, 'ci/completed')).text()).trim() !== head)
    throw new Error(`Missing completed lane for ${head}: ${lane}`);
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
      (fingerprint && summary.candidate.contentSha256 !== fingerprint)
    )
      throw new Error(`Unverified suite: ${suite}`);
    fingerprint = summary.candidate.contentSha256;
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
