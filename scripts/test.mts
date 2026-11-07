import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { XML } from 'bun';
import {
  isCallExpression,
  isElementAccessExpression,
  isIdentifier,
  isImportDeclaration,
  isNamedImports,
  isNamespaceImport,
  isParenthesizedExpression,
  isPropertyAccessExpression,
  isStringLiteral,
  visitEachChild,
} from 'typescript/unstable/ast';
import type { Node } from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/async';
import { createVirtualFileSystem } from 'typescript/unstable/fs';

import { fingerprint, writeEvidence } from '../tests/_kit/evidence.ts';
import { readLiveOptions } from '../tests/_kit/live.ts';
import type { TestEntry } from '../tests/suites.ts';
import { testEntries, typecheckFiles } from '../tests/suites.ts';

const checkFocusedTests = async (
  root: string,
  files: ReadonlyArray<string>,
) => {
  const virtualRoot = '/__hana_focus__';
  const configPath = `${virtualRoot}/tsconfig.json`;
  const sources = await Promise.all(
    files.map(async (file, index) => ({
      file,
      path: `${virtualRoot}/file-${index}.ts`,
      text: await readFile(resolve(root, file), 'utf8'),
    })),
  );
  const compiler = new API({
    cwd: virtualRoot,
    fs: createVirtualFileSystem({
      ...Object.fromEntries(
        sources.map((source) => [source.path, source.text]),
      ),
      [configPath]: JSON.stringify({
        compilerOptions: { noResolve: true, noLib: true },
        files: sources.map((source) => source.path),
      }),
    }),
  });
  try {
    const snapshot = await compiler.updateSnapshot({
      openProjects: [configPath],
    });
    try {
      const project = snapshot.getProject(configPath)!;
      for (const source of sources) {
        const parsed = await project.program.getSourceFile(source.path);
        if (!parsed)
          throw new Error(`Cannot inspect test selection: ${source.file}`);
        const named = new Set(['test', 'it', 'describe']);
        const namespaces = new Set<string>();
        for (const statement of parsed.statements) {
          if (
            !isImportDeclaration(statement) ||
            !isStringLiteral(statement.moduleSpecifier) ||
            statement.moduleSpecifier.text !== 'bun:test'
          )
            continue;
          const binding = statement.importClause?.namedBindings;
          if (binding && isNamespaceImport(binding))
            namespaces.add(binding.name.text);
          if (binding && isNamedImports(binding))
            for (const specifier of binding.elements) {
              if (
                ['test', 'it', 'describe'].includes(
                  specifier.propertyName?.text ?? specifier.name.text,
                )
              )
                named.add(specifier.name.text);
            }
        }
        const rootOf = (
          node: Node,
        ): { root: string; member?: string } | undefined => {
          if (isIdentifier(node)) return { root: node.text };
          if (isParenthesizedExpression(node) || isCallExpression(node))
            return rootOf(node.expression);
          if (
            isPropertyAccessExpression(node) ||
            isElementAccessExpression(node)
          ) {
            const parent = rootOf(node.expression);
            const member = isPropertyAccessExpression(node)
              ? node.name.text
              : isStringLiteral(node.argumentExpression)
                ? node.argumentExpression.text
                : undefined;
            return parent
              ? { ...parent, member: parent.member ?? member }
              : undefined;
          }
          return undefined;
        };
        const visit = (node: Node): Node => {
          if (
            (isPropertyAccessExpression(node) && node.name.text === 'only') ||
            (isElementAccessExpression(node) &&
              isStringLiteral(node.argumentExpression) &&
              node.argumentExpression.text === 'only')
          ) {
            const owner = rootOf(node.expression);
            if (
              owner &&
              (named.has(owner.root) ||
                (namespaces.has(owner.root) &&
                  ['test', 'it', 'describe'].includes(owner.member ?? '')))
            )
              throw new Error(`Focused selection is forbidden: ${source.file}`);
          }
          visitEachChild(node, visit);
          return node;
        };
        visit(parsed);
      }
    } finally {
      await snapshot.dispose();
    }
  } finally {
    await compiler.close();
  }
};

export const runSuite = async ({
  root = process.cwd(),
  entries = testEntries,
  suite = 'local',
}: {
  root?: string;
  entries?: ReadonlyArray<TestEntry>;
  suite?: string;
} = {}) => {
  const startedAt = new Date().toISOString();
  const candidate = await fingerprint(root);
  const directory = resolve(
    root,
    '.artifacts/testing',
    suite.replaceAll(/[^a-z\d-]/gi, '_'),
    `${Date.now()}-${crypto.randomUUID()}`,
  );
  await mkdir(directory, { recursive: true });
  const junit = resolve(directory, 'junit.xml');
  const log = resolve(directory, 'output.log');
  const files = entries
    .filter((entry) => entry.selections.includes(suite))
    .map((entry) => entry.file);
  const command = [process.execPath, ...process.argv.slice(1)];
  const commands: Array<Array<string>> = [];
  let exitCode = 1;
  let failure: string | undefined;
  const counts = { pass: 0, fail: 0, skip: 0 };
  const cases: Array<{ file: string; name: string; status: string }> = [];
  try {
    const discovered = await Array.fromAsync(
      new Bun.Glob('tests/**/*.test.ts').scan({ cwd: root }),
    );
    const registered = entries.map((entry) => entry.file);
    if (new Set(registered).size !== registered.length)
      throw new Error('Duplicate test registration');
    const missing = registered.filter((file) => !discovered.includes(file));
    const unknown = discovered.filter((file) => !registered.includes(file));
    if (missing.length || unknown.length)
      throw new Error(
        `Inventory mismatch: missing=${missing.join(',')} unclassified=${unknown.join(',')}`,
      );
    if (entries === testEntries) {
      const discoveredTypes = await Array.fromAsync(
        new Bun.Glob('tests/**/*.typecheck.ts').scan({ cwd: root }),
      );
      if (
        new Set(typecheckFiles).size !== typecheckFiles.length ||
        discoveredTypes.length !== typecheckFiles.length ||
        typecheckFiles.some((file) => !discoveredTypes.includes(file))
      )
        throw new Error('Typecheck inventory mismatch');
    }
    if (!files.length) throw new Error(`Empty or unknown suite: ${suite}`);
    await checkFocusedTests(root, files);
    const walk = (node: Bun.XML.Node): void => {
      if (node.name === 'testcase') {
        const children = node.children.filter(
          (item): item is Bun.XML.Node =>
            typeof item === 'object' && 'name' in item,
        );
        const skip = children.some((item) => item.name === 'skipped');
        const fail = children.some(
          (item) => item.name === 'failure' || item.name === 'error',
        );
        counts[skip ? 'skip' : fail ? 'fail' : 'pass']++;
        cases.push({
          file: node.attributes.file ?? '',
          name: node.attributes.name ?? '',
          status: skip ? 'skip' : fail ? 'fail' : 'pass',
        });
      }
      for (const childNode of node.children) {
        if (typeof childNode === 'object' && 'name' in childNode)
          walk(childNode);
      }
    };

    const documents: Array<Bun.XML.Node> = [];
    const failures: Array<string> = [];
    for (const [index, file] of files.entries()) {
      const rawReport = resolve(directory, `junit-${index}.xml`);
      const childLog = resolve(directory, `output-${index}.log`);
      const childCommand = [
        process.execPath,
        'test',
        `./${file}`,
        '--preload',
        resolve(import.meta.dir, '../tests/fixtures/consumers/selection.ts'),
        ...(entries === testEntries
          ? ['--preload', resolve(root, 'tests/fixtures/consumers/offline.ts')]
          : []),
        '--reporter=junit',
        `--reporter-outfile=${rawReport}`,
      ];
      commands.push(childCommand);
      const child = Bun.spawn(childCommand, {
        cwd: root,
        stdout: Bun.file(childLog),
        stderr: Bun.file(`${childLog}.stderr`),
      });
      const childExit = await child.exited;
      if (childExit !== 0)
        failures.push(`${file}: Child failed exit=${childExit}`);
      const document = XML.parse(await readFile(rawReport, 'utf8'), {
        compact: false,
      });
      if (document.name !== 'testsuites')
        throw new Error(`Invalid JUnit root: ${file}`);
      const before = cases.length;
      walk(document);
      if (
        cases.length === before ||
        Number(document.attributes.tests) !== cases.length - before
      )
        throw new Error(`Empty or inconsistent JUnit counts: ${file}`);
      documents.push(document);
    }
    const document: Bun.XML.Node = {
      name: 'testsuites',
      attributes: {
        tests: String(cases.length),
        failures: String(counts.fail),
        skipped: String(counts.skip),
      },
      children: documents.flatMap((item) => item.children),
    };
    await writeFile(junit, XML.stringify(document));
    await writeFile(
      log,
      JSON.stringify({ commands, failures }, null, 2) + '\n',
    );
    const total = counts.pass + counts.fail + counts.skip;
    if (!total || Number(document.attributes.tests) !== total)
      throw new Error('Empty or inconsistent JUnit counts');
    const absent = files.filter(
      (file) => !cases.some((item) => item.file === file),
    );
    if (absent.length)
      throw new Error(`Tests absent from JUnit: ${absent.join(',')}`);
    if (
      failures.length > 0 ||
      counts.fail ||
      counts.skip ||
      Number(document.attributes.failures) ||
      Number(document.attributes.skipped)
    )
      throw new Error(
        `Child failed or omitted tests: ${failures.join('; ')} fail=${counts.fail} skip=${counts.skip}`,
      );
    if ((await fingerprint(root)).contentSha256 !== candidate.contentSha256)
      throw new Error('Candidate changed during validation');
    exitCode = 0;
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }
  const report = await writeEvidence(
    {
      suite,
      command,
      startedAt,
      exitCode,
      counts,
      candidate,
      artifacts: { junit, log, children: directory },
      details: { files, commands, cases, failure },
    },
    root,
    directory,
  );
  return { ...report, files, failure };
};

export const runLiveSuite = async (root = process.cwd()) => {
  const startedAt = new Date().toISOString();
  const candidate = await fingerprint(root);
  const directory = resolve(
    root,
    '.artifacts/testing/live',
    `${Date.now()}-${crypto.randomUUID()}`,
  );
  await mkdir(directory, { recursive: true });
  const junit = resolve(directory, 'junit.xml');
  const log = resolve(directory, 'output.log');
  const snapshot = resolve(directory, 'live.json');
  const commands: Array<Array<string>> = [];
  const counts = { pass: 0, fail: 0, skip: 0 };
  let failure: string | undefined;
  let exitCode = 1;
  let tarball: string | undefined;
  let tarballSha256: string | undefined;
  let consumer: string | undefined;
  let live: unknown;
  try {
    const options = await readLiveOptions(process.env);
    const execute = async (
      command: Array<string>,
      cwd: string,
      env = process.env,
    ) => {
      commands.push(command);
      const child = Bun.spawn(command, {
        cwd,
        env,
        stdout: Bun.file(log),
        stderr: Bun.file(`${log}.stderr`),
      });
      if ((await child.exited) !== 0)
        throw new Error(
          'live preparation or test child failed; see sanitized logs',
        );
    };
    const findPackage = async () => {
      const summaries = await Array.fromAsync(
        new Bun.Glob('.artifacts/testing/package/*/summary.json').scan({
          cwd: root,
          absolute: true,
        }),
      );
      const reports = await Promise.all(
        summaries.map(
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
      return reports
        .filter(
          (report) =>
            report.status === 'pass' &&
            report.candidate.contentSha256 === candidate.contentSha256,
        )
        .toSorted((left, right) =>
          right.endedAt.localeCompare(left.endedAt),
        )[0];
    };
    let packaged = await findPackage();
    if (!packaged) {
      await execute([process.execPath, 'run', 'test:sdk-contract'], root);
      packaged = await findPackage();
    }
    if (!packaged)
      throw new Error('no validated tarball for this exact source candidate');
    tarball = packaged.artifacts.tarball;
    tarballSha256 = createHash('sha256')
      .update(await readFile(tarball))
      .digest('hex');
    if (tarballSha256 !== packaged.details.tarballSha256)
      throw new Error('candidate tarball changed');
    for (const file of packaged.details.files) {
      if (
        createHash('sha256')
          .update(await readFile(resolve(root, file.path)))
          .digest('hex') !== file.sha256
      )
        throw new Error('candidate package contents changed');
    }
    consumer = await mkdtemp(resolve(tmpdir(), 'hana-live-consumer-'));
    await writeFile(
      resolve(consumer, 'package.json'),
      JSON.stringify({ private: true, type: 'module' }),
    );
    await execute(
      [
        'npm',
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--no-package-lock',
        tarball,
      ],
      consumer,
    );
    const files = testEntries
      .filter((entry) => entry.selections.includes(`live:${options.suite}`))
      .map((entry) => resolve(root, entry.file));
    if (!files.length) throw new Error('empty live selection');
    await checkFocusedTests(root, files);
    const testCommand = [
      process.execPath,
      'test',
      ...files,
      '--preload',
      resolve(root, 'tests/fixtures/consumers/selection.ts'),
      '--preload',
      resolve(root, 'tests/fixtures/consumers/live.ts'),
      '--reporter=junit',
      `--reporter-outfile=${junit}`,
    ];
    commands.push(testCommand);
    const testProcess = Bun.spawn(testCommand, {
      cwd: root,
      env: {
        ...process.env,
        HANA_LIVE_PACKAGE_ENTRY: resolve(
          consumer,
          'node_modules/hana-music-api/dist/index.js',
        ),
        HANA_LIVE_SNAPSHOT: snapshot,
      },
      stdout: Bun.file(log),
      stderr: Bun.file(`${log}.stderr`),
    });
    const childExit = await testProcess.exited;
    live = JSON.parse(await readFile(snapshot, 'utf8'));
    const document = XML.parse(await readFile(junit, 'utf8'), {
      compact: false,
    });
    const walk = (node: Bun.XML.Node): void => {
      if (node.name === 'testcase') {
        const names = new Set(
          node.children
            .filter(
              (child): child is Bun.XML.Node =>
                typeof child === 'object' && 'name' in child,
            )
            .map((child) => child.name),
        );
        counts[
          names.has('skipped')
            ? 'skip'
            : names.has('failure') || names.has('error')
              ? 'fail'
              : 'pass'
        ]++;
      }
      for (const child of node.children)
        if (typeof child === 'object' && 'name' in child) walk(child);
    };
    walk(document);
    if (
      document.name !== 'testsuites' ||
      childExit !== 0 ||
      counts.fail ||
      counts.skip ||
      counts.pass !== files.length ||
      Number(document.attributes.tests) !== files.length
    )
      throw new Error(
        'live did not execute every required assertion successfully',
      );
    if ((await fingerprint(root)).contentSha256 !== candidate.contentSha256)
      throw new Error('candidate changed during live');
    exitCode = 0;
  } catch (error) {
    failure =
      error instanceof Error && error.message.startsWith('live blocked:')
        ? error.message
        : 'live failed; inspect sanitized evidence';
    if (!counts.fail) counts.fail = 1;
  } finally {
    if (consumer) await rm(consumer, { recursive: true, force: true });
  }
  return writeEvidence(
    {
      suite: 'live',
      command: [process.execPath, ...process.argv.slice(1)],
      startedAt,
      exitCode,
      counts,
      candidate,
      artifacts: { junit, log, snapshot, ...(tarball ? { tarball } : {}) },
      details: { failure, commands, tarballSha256, live },
    },
    root,
    directory,
  );
};

if (import.meta.main) {
  const suite = process.argv[2] ?? 'local';
  const report =
    suite === 'live' ? await runLiveSuite() : await runSuite({ suite });
  console.log(
    JSON.stringify({
      status: report.status,
      counts: report.counts,
      report: report.artifacts.summary,
      files: 'files' in report ? report.files : undefined,
      failure: 'failure' in report ? report.failure : undefined,
    }),
  );
  process.exitCode = report.exitCode;
}
