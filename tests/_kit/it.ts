import { test } from 'bun:test';

import type { Exit, Layer } from 'effect';
import { Effect } from 'effect';

export const runEffect = <A, E, R>(
  eff: Effect.Effect<A, E, R>,
  layer?: Layer.Layer<R>,
  options?: { readonly signal?: AbortSignal | undefined },
): Promise<A> =>
  Effect.runPromise(
    layer === undefined
      ? (eff as Effect.Effect<A, E>)
      : Effect.provide(eff, layer),
    options,
  );

export const runExit = <A, E, R>(
  eff: Effect.Effect<A, E, R>,
  layer?: Layer.Layer<R>,
): Promise<Exit.Exit<A, E>> =>
  Effect.runPromiseExit(
    layer === undefined
      ? (eff as Effect.Effect<A, E>)
      : Effect.provide(eff, layer),
  );

export interface ItOptions {
  readonly layer?: Parameters<typeof runEffect>[1];
  readonly timeout?: number;
}

const itEffectImpl = (
  name: string,
  eff: Effect.Effect<void, unknown>,
  options?: ItOptions,
): void => {
  test(name, () => runEffect(eff, options?.layer), options?.timeout);
};

export const itEffect = Object.assign(
  itEffectImpl,
  {
    skip: (
      name: string,
      eff: Effect.Effect<void, unknown>,
      options?: ItOptions,
    ): void => {
      test.skip(name, () => runEffect(eff, options?.layer), options?.timeout);
    },
  },
  {
    each:
      <A>(table: ReadonlyArray<A>) =>
      (
        name: string,
        factory: (scenario: A) => Effect.Effect<void, unknown>,
        options?: ItOptions,
      ): void => {
        test.each(Array.from(table))(name, (scenario) =>
          runEffect(factory(scenario), options?.layer),
        );
      },
  },
);
