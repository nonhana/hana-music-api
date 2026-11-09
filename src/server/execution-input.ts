import { moduleConfigKeys, removedModuleConfigKeys } from '../core/options.ts';
import type { ModuleQuery } from '../types/index.ts';
import { RequestBodyError } from './parse-body.ts';

export const validateHttpInput = (input: ModuleQuery, debug = false): void => {
  for (const key of [
    ...moduleConfigKeys.filter((candidate) => candidate !== 'cookie'),
    ...removedModuleConfigKeys,
    'cache',
    'identityPool',
  ]) {
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
