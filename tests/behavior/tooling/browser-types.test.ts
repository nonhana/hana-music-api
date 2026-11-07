import { expect, test } from 'bun:test';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import { projectRoot } from '../../_kit/assertions.ts';

const exercise = async (invalid?: 'server' | 'browser') => {
  const root = await mkdtemp(resolve(tmpdir(), 'hana-browser-types-'));
  try {
    const manifest = JSON.parse(
      await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
    ) as { scripts: { typecheck: string } };
    await mkdir(resolve(root, 'src/browser'), { recursive: true });
    await symlink(
      resolve(projectRoot, 'node_modules'),
      resolve(root, 'node_modules'),
      'dir',
    );
    await writeFile(
      resolve(root, 'package.json'),
      JSON.stringify({
        type: 'module',
        scripts: { typecheck: manifest.scripts.typecheck },
      }),
    );
    for (const path of [
      'tsconfig.json',
      'tsconfig.base.json',
      'src/browser/tsconfig.json',
    ]) {
      const source = await readFile(resolve(projectRoot, path), 'utf8').catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return undefined;
          throw error;
        },
      );
      if (source !== undefined) {
        await mkdir(dirname(resolve(root, path)), { recursive: true });
        await writeFile(resolve(root, path), source);
      }
    }
    await writeFile(
      resolve(root, 'server.ts'),
      `
      export const runtime: typeof Bun = Bun;
      // @ts-expect-error Server compilation must not acquire browser globals.
      void document;
      ${invalid === 'server' ? "export const invalidServer: number = 'invalid-server';" : ''}
    `,
    );
    await writeFile(
      resolve(root, 'src/browser/client.ts'),
      `
      export const script: HTMLScriptElement = document.createElement('script');
      export const page: Document = document;
      export const browser: Window = window;
      // @ts-expect-error Browser compilation must not acquire Bun globals.
      void Bun.version;
      // @ts-expect-error Browser compilation must not acquire Node globals.
      void process.pid;
      ${invalid === 'browser' ? "export const invalidBrowser: number = 'invalid-browser';" : ''}
    `,
    );
    const child = Bun.spawn([process.execPath, 'run', 'typecheck'], {
      cwd: root,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const [exitCode, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    return { exitCode, output: stdout + stderr };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

test('typecheck supports native DOM only in the browser project and Bun only on the server', async () => {
  const result = await exercise();
  expect(result.exitCode, result.output).toBe(0);
}, 30_000);

test('typecheck rejects an invalid browser source even when the server project is valid', async () => {
  const result = await exercise('browser');
  expect(result.exitCode).not.toBe(0);
  expect(result.output).toContain('src/browser/client.ts');
  expect(result.output).toContain('TS2322');
}, 30_000);

test('typecheck rejects an invalid server source even when the browser project is valid', async () => {
  const result = await exercise('server');
  expect(result.exitCode).not.toBe(0);
  expect(result.output).toContain('server.ts');
  expect(result.output).toContain('TS2322');
}, 30_000);
