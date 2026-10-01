import { expect } from 'bun:test';

import { Exit } from 'effect';

import { normalizeFailure } from '../../src/core/response.ts';

export const expectFailure = (exit: Exit.Exit<unknown, unknown>) => {
  expect(Exit.isFailure(exit)).toBe(true);
  if (!Exit.isFailure(exit)) {
    throw new Error('expected failure exit');
  }
  return normalizeFailure(exit.cause);
};
