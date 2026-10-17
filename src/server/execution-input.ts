import type { ModuleCallConfig, ModuleQuery } from '../types/index.ts';
import { RequestBodyError } from './parse-body.ts';

const executionKeys = [
  'acceptGzip',
  'checkToken',
  'connectionStrategy',
  'crypto',
  'deviceId',
  'domain',
  'e_r',
  'fetcher',
  'headers',
  'ip',
  'onRequestEvent',
  'proxy',
  'realIP',
  'retry',
  'signal',
  'state',
  'timeoutMs',
  'ua',
] satisfies Array<Exclude<keyof ModuleCallConfig, 'cookie'>>;

export const validateHttpInput = (input: ModuleQuery, debug = false): void => {
  for (const key of [...executionKeys, 'cache', 'identityPool']) {
    if (debug && key === 'crypto') {
      continue;
    }
    if (Object.hasOwn(input, key)) {
      throw new RequestBodyError(
        400,
        `Execution option is not allowed over HTTP: ${key}`,
      );
    }
  }
};
