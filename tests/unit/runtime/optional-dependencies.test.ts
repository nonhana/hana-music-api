import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Effect } from 'effect';
import type * as MusicMetadata from 'music-metadata';
import type * as QRCode from 'qrcode';
import type * as Undici from 'undici';

import {
  isMissingOptionalDependencyError,
  loadOptionalDependency,
} from '../../../src/core/optional-dependency.ts';
import loginQrCreate from '../../../src/modules/login_qr_create.ts';
import { projectRoot } from '../../_kit/assertions.ts';
import { runEffect } from '../../_kit/it.ts';
import { executeModule } from '../../_kit/upload.ts';

describe('optional peer dependencies', () => {
  test('package.json keeps only effect as a required dependency and marks heavy peers optional', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    };

    expect(Object.keys(manifest.dependencies ?? {})).toEqual(['effect']);
    expect(Object.keys(manifest.peerDependencies ?? {}).toSorted()).toEqual([
      'music-metadata',
      'qrcode',
      'undici',
    ]);
    for (const peer of ['music-metadata', 'qrcode', 'undici']) {
      expect(manifest.peerDependenciesMeta?.[peer]).toEqual({ optional: true });
      expect(manifest.devDependencies?.[peer]).toBeDefined();
    }
    expect(manifest.devDependencies?.hono).toBeDefined();
  });

  test('transport and optional-peer modules have no top-level static imports of optional peers', async () => {
    const checks = [
      { file: 'src/core/transport.ts', peer: 'undici' },
      { file: 'src/modules/cloud.ts', peer: 'music-metadata' },
      { file: 'src/modules/login_qr_create.ts', peer: 'qrcode' },
      { file: 'src/modules/verify_getQr.ts', peer: 'qrcode' },
    ];
    for (const { file, peer } of checks) {
      const source = await readFile(resolve(projectRoot, file), 'utf8');
      expect(source).not.toMatch(
        new RegExp(`^import\\s+(?!type\\b)[^\\n]*['"]${peer}['"]`, 'mu'),
      );
    }
  });

  test('loads installed optional peers on demand', async () => {
    const qrcode = await loadOptionalDependency<typeof QRCode>('qrcode');
    const metadata =
      await loadOptionalDependency<typeof MusicMetadata>('music-metadata');
    const undici = await loadOptionalDependency<typeof Undici>('undici');

    expect(typeof qrcode.toDataURL).toBe('function');
    expect(typeof metadata.parseBuffer).toBe('function');
    expect(typeof undici.ProxyAgent).toBe('function');
    expect(typeof undici.fetch).toBe('function');
  });

  test('classifies missing optional dependency errors without matching unrelated failures', async () => {
    const missingName = '__hana_missing_optional_peer__';
    let caught: unknown;
    try {
      await loadOptionalDependency(missingName);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeDefined();
    expect(isMissingOptionalDependencyError(caught, missingName)).toBe(true);
    expect(isMissingOptionalDependencyError(caught, 'qrcode')).toBe(false);
    expect(
      isMissingOptionalDependencyError(
        Object.assign(
          new Error(
            "Cannot find package 'pngjs' imported from /app/node_modules/qrcode/lib/renderer/png.js",
          ),
          { code: 'ERR_MODULE_NOT_FOUND' },
        ),
        'qrcode',
      ),
    ).toBe(false);
    expect(
      isMissingOptionalDependencyError(
        Object.assign(
          new Error(
            "Cannot find module 'other-pkg' imported from /Users/dev/undici-demo/index.js",
          ),
          { code: 'ERR_MODULE_NOT_FOUND' },
        ),
        'undici',
      ),
    ).toBe(false);
    expect(
      isMissingOptionalDependencyError(
        Object.assign(
          new Error(
            "Cannot find package 'undici' imported from /app/node_modules/hana-music-api/dist/src/core/optional-dependency.js",
          ),
          { code: 'ERR_MODULE_NOT_FOUND' },
        ),
        'undici',
      ),
    ).toBe(true);
    expect(
      isMissingOptionalDependencyError(
        new Error('Failed to resolve import "qrcode" from "/app/index.js"'),
        'qrcode',
      ),
    ).toBe(true);
    expect(
      isMissingOptionalDependencyError(new Error('network reset'), 'undici'),
    ).toBe(false);
    expect(isMissingOptionalDependencyError(null, 'undici')).toBe(false);
  });

  test('login_qr_create without qrimg succeeds without generating a QR image', async () => {
    const result = await runEffect(
      executeModule(loginQrCreate, { key: 'demo-key', qrimg: false }, () =>
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
          qrimg: '',
        },
      },
    });
  });
});
