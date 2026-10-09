import type { CreateRequestOptions, ModuleQuery } from '../types/index.ts';
import { RequestBodyError } from './parse-body.ts';

const executionKeys = [
  'acceptGzip',
  'connectionStrategy',
  'crypto',
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
] satisfies Array<Exclude<keyof CreateRequestOptions, 'cookie'>>;

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
