import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Effect } from 'effect';

import loginQrCreate from '../../../src/modules/login_qr_create.ts';
import { projectRoot } from '../../_kit/assertions.ts';
import { runEffect } from '../../_kit/it.ts';
import { executeModule } from '../../_kit/upload.ts';

describe('dependency boundary', () => {
  test('package.json keeps only effect as a runtime dependency and declares zero peerDependencies', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    };

    expect(Object.keys(manifest.dependencies ?? {})).toEqual(['effect']);
    expect(manifest.peerDependencies).toBeUndefined();
    expect(manifest.peerDependenciesMeta).toBeUndefined();
    expect(manifest.devDependencies?.['music-metadata']).toBeUndefined();
    expect(manifest.devDependencies?.hono).toBeDefined();
    expect(manifest.devDependencies?.qrcode).toBeDefined();
    expect(manifest.devDependencies?.undici).toBeDefined();
  });

  test('published source graph has no optional-dependency loader or third-party heavy imports', async () => {
    expect(
      existsSync(resolve(projectRoot, 'src/core/optional-dependency.ts')),
    ).toBe(false);

    const publishRoots = [
      'index.ts',
      'src/core',
      'src/modules',
      'src/plugins',
      'src/sdk',
      'src/types',
      'src/browser',
    ];
    const forbiddenThirdParty =
      /\bfrom\s+['"](?:undici|qrcode|music-metadata)(?:\/|['"])|import\s*\(\s*['"](?:undici|qrcode|music-metadata)/;
    const forbiddenHono = /\bfrom\s+['"]hono(?:\/|['"])|import\s*\(\s*['"]hono/;
    const violations: Array<string> = [];

    for (const root of publishRoots) {
      const fullRoot = resolve(projectRoot, root);
      const entries = root.endsWith('.ts')
        ? [root]
        : (await readdir(fullRoot, { recursive: true }))
            .filter((entry) => /\.tsx?$/.test(entry))
            .map((entry) => `${root}/${entry}`);
      for (const file of entries) {
        const source = await readFile(resolve(projectRoot, file), 'utf8');
        if (forbiddenThirdParty.test(source)) {
          violations.push(file);
        } else if (
          file !== 'src/types/server.ts' &&
          forbiddenHono.test(source)
        ) {
          violations.push(file);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('login_qr_create returns only qrurl without generating a QR image', async () => {
    const result = await runEffect(
      executeModule(loginQrCreate, { key: 'demo-key' }, () =>
        Effect.die('No network expected'),
      ),
    );

    expect(result).toEqual({
      status: 200,
      cookie: [],
      body: {
        code: 200,
        data: {
          qrurl: 'https://music.163.com/login?codekey=demo-key',
        },
      },
    });
  });
});
