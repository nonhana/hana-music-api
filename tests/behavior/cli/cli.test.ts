import { describe, expect, spyOn, test } from 'bun:test';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ensureAnonymousToken } from '../../../src/app/cli.ts';
import {
  generateConfig,
  registerAnonymous,
} from '../../../src/app/generate-config.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import type { FetchLike } from '../../../src/types/index.ts';

const restoreAnonymousTokenFileEnv = (
  previousValue: string | undefined,
): void => {
  if (previousValue === undefined) {
    delete Bun.env.ANONYMOUS_TOKEN_FILE;
    return;
  }

  Bun.env.ANONYMOUS_TOKEN_FILE = previousValue;
};

describe('ensureAnonymousToken', () => {
  test('should use Bun.env.ANONYMOUS_TOKEN_FILE when tokenFilePath is omitted', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'));
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token');
    const previousAnonymousTokenFile = Bun.env.ANONYMOUS_TOKEN_FILE;
    let fetchCount = 0;
    const fetcher: FetchLike = async () => {
      fetchCount += 1;

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      });
      (
        response.headers as Headers & {
          getSetCookie?: () => Array<string>;
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/'];

      return response;
    };

    try {
      Bun.env.ANONYMOUS_TOKEN_FILE = tokenFilePath;

      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
      });

      expect(token).toBe('generated-token');
      expect(fetchCount).toBe(1);
      expect(readFileSync(tokenFilePath, 'utf8')).toBe('generated-token');
    } finally {
      restoreAnonymousTokenFileEnv(previousAnonymousTokenFile);
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      });
    }
  });

  test('should prefer explicit tokenFilePath over Bun.env.ANONYMOUS_TOKEN_FILE', async () => {
    const envTemporaryDirectory = mkdtempSync(
      join(tmpdir(), 'hana-cli-token-env-'),
    );
    const explicitTemporaryDirectory = mkdtempSync(
      join(tmpdir(), 'hana-cli-token-explicit-'),
    );
    const envTokenFilePath = join(envTemporaryDirectory, 'anonymous_token');
    const explicitTokenFilePath = join(
      explicitTemporaryDirectory,
      'anonymous_token',
    );
    const previousAnonymousTokenFile = Bun.env.ANONYMOUS_TOKEN_FILE;
    writeFileSync(envTokenFilePath, 'env-token', 'utf8');
    let fetchCount = 0;
    const fetcher: FetchLike = async () => {
      fetchCount += 1;

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      });
      (
        response.headers as Headers & {
          getSetCookie?: () => Array<string>;
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/'];

      return response;
    };

    try {
      Bun.env.ANONYMOUS_TOKEN_FILE = envTokenFilePath;

      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
        tokenFilePath: explicitTokenFilePath,
      });

      expect(token).toBe('generated-token');
      expect(fetchCount).toBe(1);
      expect(readFileSync(explicitTokenFilePath, 'utf8')).toBe(
        'generated-token',
      );
      expect(readFileSync(envTokenFilePath, 'utf8')).toBe('env-token');
    } finally {
      restoreAnonymousTokenFileEnv(previousAnonymousTokenFile);
      rmSync(envTemporaryDirectory, {
        force: true,
        recursive: true,
      });
      rmSync(explicitTemporaryDirectory, {
        force: true,
        recursive: true,
      });
    }
  });

  test('should generate and persist an anonymous token when the token file is missing', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'));
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token');
    let fetchCount = 0;
    const fetcher: FetchLike = async () => {
      fetchCount += 1;

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      });
      (
        response.headers as Headers & {
          getSetCookie?: () => Array<string>;
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/'];

      return response;
    };

    try {
      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
        tokenFilePath,
      });

      expect(token).toBe('generated-token');
      expect(fetchCount).toBe(1);
      expect(readFileSync(tokenFilePath, 'utf8')).toBe('generated-token');
    } finally {
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      });
    }
  });

  test('should reuse an existing anonymous token without generating a new one', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'));
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token');
    writeFileSync(tokenFilePath, 'existing-token', 'utf8');
    let fetchCount = 0;
    const fetcher: FetchLike = async () => {
      fetchCount += 1;

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      });
    };

    try {
      const token = await ensureAnonymousToken({
        fetcher,
        tokenFilePath,
      });

      expect(token).toBe('existing-token');
      expect(fetchCount).toBe(0);
    } finally {
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      });
    }
  });
});

test('CLI registration writes state before requests and retains a success without MUSIC_A', async () => {
  const previous = getRuntimeState();
  try {
    const result = await registerAnonymous({
      state: { deviceId: 'cli-before-send', cnIp: '3.3.3.3' },
      fetcher: async (input) => {
        expect(input instanceof Request ? input.url : input.toString()).toBe(
          'https://music.163.com/weapi/register/anonimous',
        );
        expect(getRuntimeState()).toMatchObject({
          deviceId: 'cli-before-send',
          cnIp: '3.3.3.3',
          anonymousToken: '',
        });
        return Response.json(
          { code: 200, marker: 'raw-response' },
          { headers: { 'set-cookie': 'other=value; Path=/' } },
        );
      },
    });
    expect(result).toMatchObject({
      status: 200,
      body: {
        code: 200,
        marker: 'raw-response',
        cookie: 'other=value; Path=/',
      },
      cookie: ['other=value; Path=/'],
    });
  } finally {
    setRuntimeState(previous);
  }
});

test.each(['empty', 'request', 'file'] as const)(
  'CLI generation keeps the %s failure and file boundary',
  async (mode) => {
    const previous = getRuntimeState();
    const directory = mkdtempSync(join(tmpdir(), 'hana-cli-failure-'));
    const tokenFilePath =
      mode === 'file' ? directory : join(directory, 'token');
    const errors = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const result = await generateConfig({
        tokenFilePath,
        state: { deviceId: 'cli-failure', cnIp: '4.4.4.4' },
        fetcher: async () => {
          if (mode === 'request') throw new Error('controlled request failure');
          return Response.json(
            { code: 200 },
            mode === 'empty'
              ? {}
              : { headers: { 'set-cookie': 'MUSIC_A=not-persisted; Path=/' } },
          );
        },
      });
      expect(result).toBe('');
      expect(getRuntimeState()).toMatchObject({
        deviceId: 'cli-failure',
        cnIp: '4.4.4.4',
        anonymousToken: '',
      });
      expect(errors.mock.calls.length).toBe(mode === 'empty' ? 0 : 1);
      if (mode !== 'file') expect(existsSync(tokenFilePath)).toBe(false);
    } finally {
      errors.mockRestore();
      setRuntimeState(previous);
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
