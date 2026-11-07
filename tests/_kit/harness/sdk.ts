import type { RequestEntropy } from '../../../src/core/request-plan.ts';

export const testEntropy = (now: number): RequestEntropy => ({
  now,
  nuid: '0'.repeat(32),
  nmtid: '1'.repeat(16),
  wnmcid: `abcdef.${now}.01.0`,
  requestId: `${now}_0000`,
  weapiSecret: 'aaaaaaaaaaaaaaaa',
});

export const createStage = (name: string) => {
  let reach!: () => void;
  const ready = new Promise<void>((resolve) => {
    reach = resolve;
  });
  return {
    reach,
    wait: <Value>(pending: Value | PromiseLike<Value>): Promise<void> =>
      Promise.race([
        ready,
        Promise.resolve(pending).then(
          () => {
            throw new Error(`Call ended before stage: ${name}`);
          },
          (cause: unknown) => {
            throw new Error(`Call failed before stage: ${name}`, { cause });
          },
        ),
      ]),
  };
};
