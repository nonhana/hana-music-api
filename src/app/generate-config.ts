import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import type { InternalExecution } from '../core/call-context.ts';
import { resolveIdentitySnapshot } from '../core/identity-snapshot.ts';
import { runRequestAtEdge } from '../core/request.ts';
import { toModuleResponse } from '../core/response.ts';
import { setRuntimeState } from '../core/runtime.ts';
import {
  cookieToJson,
  encodeAnonymousDeviceId,
  generateDeviceId,
  generateRandomChineseIP,
  isRecord,
} from '../core/utils.ts';
import type { GenerateConfigOptions, NcmApiResponse } from '../types/index.ts';

const DEFAULT_ANONYMOUS_TOKEN_PATH = resolve(tmpdir(), 'anonymous_token');

export const readAnonymousToken = (
  filePath = DEFAULT_ANONYMOUS_TOKEN_PATH,
): string => {
  try {
    return readFileSync(filePath, 'utf8').trim();
  } catch {
    return '';
  }
};

const writeAnonymousToken = (
  token: string,
  filePath = DEFAULT_ANONYMOUS_TOKEN_PATH,
): void => {
  mkdirSync(dirname(filePath), {
    recursive: true,
  });
  writeFileSync(filePath, token, 'utf8');
  setRuntimeState({
    anonymousToken: token,
  });
};

export const registerAnonymous = async (
  options: GenerateConfigOptions = {},
  execution?: InternalExecution,
): Promise<NcmApiResponse> => {
  const state = resolveIdentitySnapshot(options, {
    anonymousToken: '',
    cnIp: generateRandomChineseIP(),
    deviceId: generateDeviceId(),
  }).state;
  const deviceId = state.deviceId;

  setRuntimeState(state);

  const result = toModuleResponse(
    await runRequestAtEdge(
      {
        target: '/api/register/anonimous',
        protocol: 'weapi',
        method: 'POST',
        headers: {},
        response: 'json',
        semantic: 'login',
        body: JSON.stringify({
          username: Buffer.from(
            `${deviceId} ${encodeAnonymousDeviceId(deviceId)}`,
            'utf8',
          ).toString('base64'),
        }),
      },
      {
        crypto: 'weapi',
        fetcher: options.fetcher,
        state,
      },
      execution,
    ),
  );

  if (isRecord(result.body) && result.body.code === 200) {
    return {
      ...result,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
    };
  }

  return result;
};

export const generateConfig = async (
  options: GenerateConfigOptions = {},
): Promise<string> => {
  const cnIp = options.state?.cnIp ?? generateRandomChineseIP();
  setRuntimeState({
    cnIp,
  });

  try {
    const result = await registerAnonymous({
      ...options,
      state: {
        ...options.state,
        cnIp,
      },
    });
    const cookieSource = result.cookie.join('; ');
    const cookie = cookieToJson(cookieSource);
    const token = String(cookie.MUSIC_A ?? '');

    if (token) {
      writeAnonymousToken(token, options.tokenFilePath);
    }

    return token;
  } catch (error) {
    console.error('[generateConfig] failed to create anonymous token', error);
    return '';
  }
};
