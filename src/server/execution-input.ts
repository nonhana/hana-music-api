import type { CreateRequestOptions, ModuleQuery } from '../types/index.ts';

const executionKeys = [
  'acceptGzip',
  'checkToken',
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
      throw {
        status: 400,
        cookie: [],
        body: {
          code: 400,
          msg: `Execution option is not allowed over HTTP: ${key}`,
        },
      };
    }
  }
};
