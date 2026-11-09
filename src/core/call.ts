// cspell:ignore anticheattoken
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
import {
  Call,
  CallServices,
  ExecutionScope,
  resolveExecutionScope,
} from './call-context.ts';
import type {
  CallInput,
  CallShape,
  InternalExecution,
} from './call-context.ts';
import { isCacheable } from './endpoint-policy.ts';
import { DeadlineExceeded, InvalidRequest, PartialUpload } from './errors.ts';
import {
  createIdentityPool,
  isDeviceId,
  resolveIdentitySnapshot,
} from './identity.ts';
import { validateModuleConfig, validateModuleQuery } from './options.ts';
import { ReadStore } from './read-store.ts';
import {
  modulePolicy,
  normalizeActionTarget,
  validateModuleActions,
} from './request-actions.ts';
import type { ResolvedRequest } from './request-plan.ts';
import { requestProfiles } from './request-profiles.ts';
import { requestEffect, snapshotRequestData } from './request.ts';
import {
  ProcessServices,
  resolveProcessServices,
  runPublicEffect,
} from './runtime.ts';
import { isRecord, resolveRequestCookie, stableStringify } from './utils.ts';

export { ProcessServices } from './runtime.ts';

export {
  Call,
  CallServices,
  type CallInput,
  type CallShape,
} from './call-context.ts';

/** 构造 CallServices 的纯值形态：服务集无 scope 资源（ReadStore 自管理 TTL）。 */
export const buildCallServices = (
  config: CreateHanaMusicApiConfig = {},
  initializeAnonymous = true,
  execution: InternalExecution = {},
): Context.Service.Shape<typeof CallServices> => {
  validateModuleConfig(config, true);
  return {
    process: resolveProcessServices(),
    reads: new ReadStore<NcmApiResponse>(
      config.cache && config.cache.enabled !== false
        ? (config.cache.ttlMs ?? 120_000)
        : null,
    ),
    pool: config.identityPool
      ? createIdentityPool(
          config.identityPool,
          { ...config, fetcher: config.fetcher ?? execution.fetcher },
          (options) => registerAnonymous(options, execution),
        )
      : null,
    initializeAnonymous,
    execution: Object.freeze({ ...execution }),
  };
};

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
  clock?: Clock.Clock,
): Promise<NcmApiResponse> => {
  try {
    validateModuleConfig(input.config);
  } catch (error) {
    return runPublicEffect(Effect.fail(error));
  }
  // 原对象先校验，再合并；否则非枚举旧键会在 spread 中丢失。
  // 直接入口保留原对象的 signal；具名/client 沿用原来的默认配置浅合并。
  const configSource =
    input.defaults === undefined
      ? input.config
      : { ...input.defaults, ...input.config };
  const { signal, ...callConfig } = configSource;
  let actions;
  try {
    validateModuleQuery(input.input);
    actions = validateModuleActions(implementation.actions);
  } catch (error) {
    return runPublicEffect(
      Effect.fail(
        error instanceof InvalidRequest
          ? error
          : InvalidRequest.make({
              message: 'Invalid module config or actions',
            }),
      ),
    );
  }
  const declaredPolicy = modulePolicy(actions);
  const upload = declaredPolicy.upload;
  const configuredTimeout = callConfig.timeoutMs;
  let timeoutMs = configuredTimeout ?? 8_000;
  if (upload) {
    timeoutMs = 300_000;
    if (configuredTimeout !== undefined && configuredTimeout > 0) {
      timeoutMs = Math.min(configuredTimeout, 300_000);
    }
  }
  const moduleFailure = Ref.makeUnsafe(Option.none<PartialUpload>());
  const work = Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const decodedInput = yield* implementation.decodeInput(input.input);
    const scoped = yield* CallServices;
    const config = {
      ...callConfig,
      fetcher: callConfig.fetcher ?? scoped.execution?.fetcher,
      cookie: resolveRequestCookie(callConfig),
      retry: callConfig.retry
        ? Object.freeze({
            ...callConfig.retry,
            statusCodes: callConfig.retry.statusCodes
              ? Object.freeze([...callConfig.retry.statusCodes])
              : undefined,
          })
        : undefined,
      state: callConfig.state
        ? Object.freeze({ ...callConfig.state })
        : undefined,
    };
    const explicitIdentity =
      config.cookie.MUSIC_U ||
      config.cookie.MUSIC_A ||
      config.state?.anonymousToken;
    const needsSession = Object.values(actions).some(
      (action) => requestProfiles[action.profile].protocol !== 'plain',
    );
    const explicitDevice =
      isDeviceId(config.state?.deviceId) || isDeviceId(config.cookie.deviceId);
    const identityConfig =
      !explicitIdentity && !explicitDevice && needsSession && scoped.pool
        ? yield* scoped.pool.next
        : undefined;
    const effective = identityConfig
      ? {
          ...config,
          cookie: { MUSIC_A: identityConfig.anonymousToken },
          ip: identityConfig.cnIp,
          state: Object.freeze({
            ...identityConfig,
            ...config.state,
            deviceId: identityConfig.deviceId,
          }),
        }
      : config;
    const runtime = scoped.process.readState();
    let identity = resolveIdentitySnapshot(effective, runtime);
    if (
      !explicitIdentity &&
      !identityConfig &&
      scoped.initializeAnonymous &&
      needsSession
    ) {
      const token = yield* ensureAnonymousEffect(
        { ...effective, state: identity.state },
        scoped.execution,
      ).pipe(Effect.provideService(ProcessServices, scoped.process));
      identity = Object.freeze({
        ...identity,
        cookie: Object.freeze({ ...identity.cookie, MUSIC_A: token }),
        state: Object.freeze({ ...identity.state, anonymousToken: token }),
        fingerprint: createHash('sha256')
          .update(JSON.stringify([token, identity.state.deviceId]))
          .digest('hex'),
        source: 'runtime-anonymous' as const,
      });
    }
    const read = effective.checkToken === undefined && declaredPolicy.shared;
    const call: CallShape = Object.freeze({
      identifier: input.identifier,
      actions,
      input: Object.freeze({ ...decodedInput }),
      identity,
      policy: Object.freeze({
        read,
        upload,
      }),
      checkTokenUses: read ? undefined : Ref.makeUnsafe(0),
      tokenSource: effective.checkToken,
      ip: effective.realIP ?? effective.ip ?? identity.state.cnIp,
      retry: effective.retry,
      completedStages: upload
        ? Ref.makeUnsafe<ReadonlyArray<string>>([])
        : undefined,
    });

    const scope = resolveExecutionScope(
      effective,
      scoped.execution,
      startedAt,
      read ? 0 : timeoutMs,
      upload ? 60_000 : undefined,
    );
    const capability: RequestCapability = (name, args) =>
      Effect.gen(function* () {
        const action =
          typeof name === 'string' && Object.hasOwn(actions, name)
            ? actions[name]
            : undefined;
        if (!action) {
          return yield* InvalidRequest.make({
            message: 'Request must match a declared module action',
          });
        }

        const profile = requestProfiles[action.profile];
        const allowedArguments = ['headers'];
        if (profile.protocol === 'plain') {
          allowedArguments.push('body');
          allowedArguments.push(
            typeof action.target === 'string' ? 'query' : 'target',
          );
        } else {
          allowedArguments.push('data');
          if (typeof action.target !== 'string') {
            allowedArguments.push('path');
          }
        }
        if (
          !isRecord(args) ||
          Reflect.ownKeys(args).some(
            (key) => typeof key !== 'string' || !allowedArguments.includes(key),
          )
        ) {
          return yield* InvalidRequest.make({
            message:
              'Request arguments must contain only business parameters for the declared action',
          });
        }

        // 数据先取得自有快照，根对象资格仍留在取 token 后检查。
        const data =
          profile.protocol === 'plain'
            ? undefined
            : snapshotRequestData(args.data);

        let requestedTarget: string | undefined;
        if (typeof action.target === 'string') {
          requestedTarget = action.target;
          if (profile.protocol === 'plain') {
            const query = args.query;
            if (query !== undefined && typeof query !== 'string') {
              return yield* InvalidRequest.make({
                message: 'Plain action query must be a string',
              });
            }
            requestedTarget = `${profile.domain}${action.target}`;
            if (query !== undefined) {
              requestedTarget += `?${query}`;
            }
          }
        } else if (profile.protocol === 'plain') {
          requestedTarget = args.target;
        } else {
          requestedTarget = args.path;
        }
        if (typeof requestedTarget !== 'string') {
          return yield* InvalidRequest.make({
            message: 'Request action requires its declared target parameters',
          });
        }

        const logicalTarget = requestedTarget;
        const target = yield* Effect.try({
          try: () =>
            normalizeActionTarget(logicalTarget, profile, action.target),
          catch: (error) =>
            error instanceof InvalidRequest
              ? error
              : InvalidRequest.make({
                  message: 'Invalid request action target',
                }),
        });
        let encodedPath = target;
        switch (profile.protocol) {
          case 'weapi':
          case 'eapi':
            encodedPath = `/${profile.protocol}/${target.slice(5)}`;
            break;
          case 'linuxapi':
            encodedPath = '/api/linux/forward';
            break;
          case 'api':
          case 'plain':
            break;
        }
        const expectedUrl =
          profile.protocol === 'plain'
            ? target
            : new URL(encodedPath, profile.domain).href;

        const requestSettings = {
          target,
          method: action.method ?? 'POST',
          response: action.response ?? 'json',
          identity: call.identity,
          ip: call.ip,
          retry: call.retry,
          policy: {
            semantic: action.semantic,
            retry: action.retry,
          },
          token: {
            source: call.checkTokenUses ? call.tokenSource : undefined,
            uses: call.checkTokenUses,
            managed: call.checkTokenUses !== undefined,
          },
          expectedUrl,
        };
        const suppliedHeaders = args.headers;
        const headers = suppliedHeaders === undefined ? {} : suppliedHeaders;
        let resolvedRequest: ResolvedRequest;
        if (profile.protocol === 'plain') {
          resolvedRequest = {
            ...requestSettings,
            protocol: 'plain',
            headers,
            body: args.body,
          };
        } else {
          resolvedRequest = {
            ...requestSettings,
            protocol: profile.protocol,
            headers,
            data,
            client: {
              domain: profile.domain,
              userAgent: profile.userAgent,
              cookie: profile.cookie,
              controlledCookies: [
                ...profile.omitCookies,
                ...Object.keys(profile.cookie),
              ],
              controlledHeaders: [
                'cookie',
                'user-agent',
                'referer',
                'host',
                'content-type',
                'content-length',
                'x-anticheattoken',
                'x-aeapi',
              ],
              encryptResponse: profile.encryptResponse,
              acceptGzip: profile.acceptGzip,
            },
          };
        }

        // 成功阶段的记账不可被返回与追加之间的取消打断。
        return yield* Effect.uninterruptibleMask((restore) =>
          Effect.gen(function* () {
            const response = yield* restore(requestEffect(resolvedRequest));
            if (call.completedStages) {
              yield* Ref.update(call.completedStages, (stages) => [
                ...stages,
                logicalTarget,
              ]);
            }
            return response;
          }),
        );
      });
    const execute = implementation.execute(decodedInput, capability).pipe(
      Effect.onExit((exit) => {
        const error = Exit.isFailure(exit)
          ? Cause.squash(exit.cause)
          : undefined;
        return error instanceof PartialUpload
          ? Ref.set(moduleFailure, Option.some(error))
          : Effect.void;
      }),
      Effect.provideService(Call, call),
      Effect.provideService(ExecutionScope, scope),
    );
    if (!call.policy.read) {
      return yield* execute;
    }
    const {
      onRequestEvent: _events,
      timeoutMs: _timeout,
      ...keyConfig
    } = {
      ...effective,
      cookie:
        Object.keys(identity.cookie).length || callConfig.cookie !== undefined
          ? identity.cookie
          : undefined,
    };
    const references = [implementation.execute, effective.fetcher].map(
      (reference) => {
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
      },
    );
    const key = createHash('sha256')
      .update(
        stableStringify({
          identifier: call.identifier,
          actions: call.actions,
          input: call.input,
          config: keyConfig,
          identity: call.identity.fingerprint,
          references,
        }),
      )
      .digest('hex');
    return yield* scoped.reads.run(key, execute, {
      cache: read,
      cacheable: isCacheable,
    });
  });
  const executionClock = clock ?? services.execution?.clock;
  return runPublicEffect(
    (timeoutMs > 0
      ? work.pipe(
          Effect.timeoutOrElse({
            duration: timeoutMs,
            orElse: () =>
              Effect.fail(
                DeadlineExceeded.make({ message: 'Request timed out' }),
              ),
          }),
        )
      : work
    ).pipe(Effect.provideService(CallServices, services), (effect) =>
      executionClock
        ? Effect.provideService(Clock.Clock, executionClock)(effect)
        : effect,
    ),
    signal,
    () => Option.getOrUndefined(Effect.runSync(Ref.get(moduleFailure))),
  );
};
