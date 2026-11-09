import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { projectRoot } from '../../_kit/assertions.ts';

test('module direct dynamic invocation types reject execution keys in both queries', async () => {
  const options = ["crypto: 'api'", 'cache: {}', 'identityPool: { size: 1 }'];
  await mkdir(resolve(projectRoot, '.artifacts/testing'), { recursive: true });
  const directory = await mkdtemp(
    resolve(projectRoot, '.artifacts/testing/module-config-types-'),
  );
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
      const calls = options.flatMap((option, index) => [
        `const staticCall${index} = () => invokeModule('lyric', { id: '1'${invalid ? `, ${option}` : ''} }, {}, { state: { deviceId: 'device' } });`,
        `const identifier${index}: string = 'custom';`,
        `const dynamicCall${index} = () => invokeModule(identifier${index}, { id: '1'${invalid ? `, ${option}` : ''} }, { modulesDirectory: '/unused' }, { state: { deviceId: 'device' } });`,
        `void staticCall${index}; void dynamicCall${index};`,
      ]);
      await writeFile(
        resolve(directory, 'control.ts'),
        [
          `import { invokeModule } from ${JSON.stringify(resolve(projectRoot, 'src/app/module-api.ts'))};`,
          ...calls,
          `const clientConfig: import(${JSON.stringify(resolve(projectRoot, 'index.ts'))}).CreateHanaMusicApiConfig = { cache: { enabled: true }, identityPool: { size: 2 } };`,
          'void clientConfig;',
        ].join('\n'),
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
      if (!invalid) expect(exitCode, output).toBe(0);
      else {
        expect(exitCode, output).not.toBe(0);
        for (const line of [2, 4, 6, 8, 10, 12])
          expect(output).toContain(`control.ts(${line},`);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
