import { createHash } from 'node:crypto';

import type { Context } from 'effect';
import { Cause, Clock, Effect, Exit, Option, Ref } from 'effect';

import type {
  CreateHanaMusicApiConfig,
  ModuleDefinition,
  ModuleQuery,
  NcmApiResponse,
  RequestCapability,
} from '../types/index.ts';
import {
  ensureAnonymousEffect,
  registerAnonymousEffect as registerAnonymous,
} from './anonymous.ts';
import { Call, CallServices } from './call-context.ts';
import type { CallInput, CallShape } from './call-context.ts';
import {
  isCacheable,
  isReadModule,
  isUploadModule,
} from './endpoint-policy.ts';
import { DeadlineExceeded, PartialUpload } from './errors.ts';
import { createIdentityPool, resolveIdentitySnapshot } from './identity.ts';
import { ReadStore } from './read-store.ts';
import { requestEffect, withRequestDeadline } from './request.ts';
import {
  ProcessServices,
  resolveProcessServices,
  runPublicEffect,
} from './runtime.ts';
import { resolveRequestCookie, stableStringify } from './utils.ts';

export { ProcessServices } from './runtime.ts';

export {
  Call,
  CallServices,
  type CallConfig,
  type CallInput,
  type CallShape,
} from './call-context.ts';

/** 构造 CallServices 的纯值形态：服务集无 scope 资源（ReadStore 自管理 TTL）。 */
export const buildCallServices = (
  config: CreateHanaMusicApiConfig = {},
  initializeAnonymous = true,
): Context.Service.Shape<typeof CallServices> => ({
  process: resolveProcessServices(),
  reads: new ReadStore<NcmApiResponse>(
    config.cache && config.cache.enabled !== false
      ? (config.cache.ttlMs ?? 120_000)
      : null,
  ),
  pool: config.identityPool
    ? createIdentityPool(config.identityPool, config, registerAnonymous)
    : null,
  initializeAnonymous,
});

export const createServiceLayer = (cacheTtlMs: number | null = 120_000) =>
  buildCallServices(
    { cache: cacheTtlMs === null ? { enabled: false } : { ttlMs: cacheTtlMs } },
    false,
  );

const effectReferences = new WeakMap<object, number>();
let nextEffectReference = 1;

export const runCall = <Input extends ModuleQuery>(
  input: CallInput,
  services: Context.Service.Shape<typeof CallServices>,
  implementation: ModuleDefinition<string, Input>,
  request: RequestCapability = requestEffect,
  clock?: Clock.Clock,
): Promise<NcmApiResponse> => {
  const upload = isUploadModule(input.identifier);
  const configuredTimeout = input.config.timeoutMs;
  const timeoutMs = upload
    ? configuredTimeout && configuredTimeout > 0
      ? Math.min(configuredTimeout, 300_000)
      : 300_000
    : (configuredTimeout ?? 8_000);
  const moduleFailure = Ref.makeUnsafe(Option.none<PartialUpload>());
  const work = Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const decodedInput = yield* implementation.decodeInput(input.input);
    const scoped = yield* CallServices;
    const config = {
      ...input.config,
      cookie: resolveRequestCookie(input.config),
      headers: input.config.headers
        ? Object.freeze({ ...input.config.headers })
        : undefined,
      retry: input.config.retry
        ? Object.freeze({
            ...input.config.retry,
            statusCodes: input.config.retry.statusCodes
              ? Object.freeze([...input.config.retry.statusCodes])
              : undefined,
          })
        : undefined,
      state: input.config.state
        ? Object.freeze({ ...input.config.state })
        : undefined,
    };
    const explicitIdentity =
      config.cookie.MUSIC_U ||
      config.cookie.MUSIC_A ||
      config.state?.anonymousToken;
    const identityConfig =
      !explicitIdentity && scoped.pool ? yield* scoped.pool.next : undefined;
    if (!explicitIdentity && !scoped.pool && scoped.initializeAnonymous) {
      yield* ensureAnonymousEffect(config).pipe(
        Effect.provideService(ProcessServices, scoped.process),
      );
    }
    const effective = identityConfig
      ? {
          ...config,
          ...identityConfig,
          state: Object.freeze({ ...identityConfig.state, ...config.state }),
        }
      : config;
    const identity = resolveIdentitySnapshot(
      effective,
      scoped.process.readState(effective.state),
    );
    const read = isReadModule(input.identifier);
    const call: CallShape = Object.freeze({
      identifier: input.identifier,
      input: Object.freeze({ ...decodedInput }),
      config: Object.freeze({
        ...effective,
        cookie:
          Object.keys(identity.cookie).length ||
          input.config.cookie !== undefined
            ? identity.cookie
            : undefined,
      }),
      identity,
      policy: Object.freeze({
        read,
        upload,
        cache: read,
        cacheable: isCacheable,
        stageTimeoutMs: upload ? 60_000 : undefined,
      }),
      startedAt,
      deadlineAt: timeoutMs > 0 ? startedAt + timeoutMs : undefined,
    });

    const executionCall: CallShape = call.policy.read
      ? {
          identifier: call.identifier,
          input: call.input,
          config: Object.freeze({
            ...call.config,
            timeoutMs: undefined,
          }),
          identity: call.identity,
          policy: call.policy,
          startedAt: call.startedAt,
          deadlineAt: undefined,
        }
      : call;
    const capability: RequestCapability =
      request === requestEffect
        ? request
        : (intent) => withRequestDeadline(request(intent));
    // decodedInput 即 Input 类型；Call.input 接口上是宽类型，执行时无需断言回窄。
    const execute = implementation.execute(decodedInput, capability).pipe(
      Effect.onExit((exit) => {
        const error = Exit.isFailure(exit)
          ? Cause.squash(exit.cause)
          : undefined;
        return error instanceof PartialUpload
          ? Ref.set(moduleFailure, Option.some(error))
          : Effect.void;
      }),
      Effect.provideService(Call, executionCall),
    );
    if (!call.policy.read) {
      return yield* execute;
    }
    const {
      onRequestEvent: _events,
      timeoutMs: _timeout,
      ...keyConfig
    } = call.config;
    const references = [
      implementation.execute,
      call.config.fetcher,
      request,
    ].map((reference) => {
      if (!reference) {
        return 0;
      }
      const known = effectReferences.get(reference);
      if (known !== undefined) {
        return known;
      }
      const assigned = nextEffectReference++;
      effectReferences.set(reference, assigned);
      return assigned;
    });
    const key = createHash('sha256')
      .update(
        stableStringify({
          identifier: call.identifier,
          input: call.input,
          config: keyConfig,
          identity: call.identity.fingerprint,
          references,
        }),
      )
      .digest('hex');
    return yield* scoped.reads.run(key, execute, {
      cache: call.policy.cache,
      cacheable: call.policy.cacheable,
    });
  });
  return runPublicEffect(
    (timeoutMs > 0
      ? work.pipe(
          Effect.timeoutOrElse({
            duration: timeoutMs,
            orElse: () =>
              Effect.fail(
                new DeadlineExceeded({ message: 'Request timed out' }),
              ),
          }),
        )
      : work
    ).pipe(Effect.provideService(CallServices, services), (effect) =>
      clock ? Effect.provideService(Clock.Clock, clock)(effect) : effect,
    ),
    input.signal,
    () => Option.getOrUndefined(Effect.runSync(Ref.get(moduleFailure))),
  );
};
