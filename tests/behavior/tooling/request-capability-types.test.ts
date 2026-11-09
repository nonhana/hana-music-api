import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { projectRoot } from '../../_kit/assertions.ts';

test('bound capability types constrain local actions and API/plain parameters', async () => {
  await mkdir(resolve(projectRoot, '.artifacts/testing'), { recursive: true });
  const directory = await mkdtemp(
    resolve(projectRoot, '.artifacts/testing/bound-action-types-'),
  );
  const prefix = [
    `import type {RequestCapability} from ${JSON.stringify(resolve(projectRoot, 'src/types/runtime.ts'))};`,
    `const actions = {read: {profile: 'api', target: '/api/flow', semantic: 'read', cache: 'none', retry: 'never'}, dynamic: {profile: 'web', target: {prefix: '/api/range/'}, semantic: 'read', cache: 'none', retry: 'never'}, page: {profile: 'plainMusic', target: '/playlist', method: 'GET', response: 'text', semantic: 'read', cache: 'none', retry: 'never'}, upload: {profile: 'plainNos', target: {prefix: '/jd-musicrep-privatecloud-audio-public/'}, method: 'POST', response: 'bytes', semantic: 'upload', cache: 'none', retry: 'never'}} as const;`,
    'declare const request: RequestCapability<typeof actions>;',
    'declare const empty: RequestCapability<{}>;',
    'const bytes = new Uint8Array([1, 2]); void empty;',
  ];
  const positive = [
    "request('read', {data: {id: 1}, headers: {'x-nos-token': 'value'}});",
    "request('dynamic', {path: '/api/range/1', data: {}});",
    "request('page', {query: 'id=a%2Bb'});",
    "request('upload', {target: 'https://nosup-hz1.127.net/jd-musicrep-privatecloud-audio-public/key', body: bytes});",
  ];
  const negative = [
    "request('missing', {data: {}});",
    ...[
      'protocol',
      'domain',
      'ua',
      'method',
      'response',
      'semantic',
      'cache',
      'retry',
    ].map((key) => `request('read', {data: {}, ${key}: 'forbidden'});`),
    "request('read', {data: {}, path: '/api/flow'});",
    "request('read', {body: bytes});",
    "request('dynamic', {data: {}});",
    "request('page', {data: {}});",
    "request('page', {target: 'https://music.163.com/playlist'});",
    "request('upload', {query: 'id=1'});",
    "request('upload', {target: 'https://nosup-hz1.127.net/key', data: {}});",
    "empty('read', {data: {}});",
    "const controlled = {data: {}, method: 'GET'}; request('read', controlled);",
  ];
  try {
    await writeFile(
      resolve(directory, 'tsconfig.json'),
      JSON.stringify({
        extends: resolve(projectRoot, 'tsconfig.json'),
        include: ['control.ts'],
        exclude: [],
      }),
    );
    for (const invalid of [false, true]) {
      await writeFile(
        resolve(directory, 'control.ts'),
        [...prefix, ...(invalid ? negative : positive)].join('\n'),
      );
      const child = Bun.spawn(
        [
          process.execPath,
          resolve(projectRoot, 'node_modules/typescript/bin/tsc'),
          '--project',
          resolve(directory, 'tsconfig.json'),
          '--pretty',
          'false',
        ],
        { stdout: 'pipe', stderr: 'pipe' },
      );
      const [exitCode, stdout, stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      const output = stdout + stderr;
      expect(exitCode, output).toBe(invalid ? 1 : 0);
      if (invalid)
        for (let index = 0; index < negative.length; index++)
          expect(output).toContain(`control.ts(${prefix.length + index + 1},`);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
