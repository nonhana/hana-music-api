import type { RequestSemantic } from '../types/index.ts';
import { InvalidRequest } from './errors.ts';
import { requestProfiles } from './request-profiles.ts';
import type { RequestProfile, RequestProfileName } from './request-profiles.ts';
import { isRecord } from './utils.ts';

export interface RequestAction {
  readonly profile: RequestProfileName;
  readonly target: string | { readonly prefix: string };
  readonly semantic: RequestSemantic;
  readonly cache: 'none' | 'shared';
  readonly retry: 'never' | 'connect' | 'read';
  readonly method?: string;
  readonly response?: 'json' | 'text' | 'bytes';
}

export type ModuleActions = Readonly<Record<string, RequestAction>>;

const actionSnapshots = new WeakMap<object, ModuleActions>();
const policies = new WeakMap<
  ModuleActions,
  { readonly shared: boolean; readonly upload: boolean }
>();
export const modulePolicy = (actions: ModuleActions) => {
  const cached = policies.get(actions);
  if (cached) return cached;
  const values = Object.values(actions);
  const policy = Object.freeze({
    shared:
      values.length > 0 &&
      values.every(
        (action) => action.semantic === 'read' && action.cache === 'shared',
      ),
    upload: values.some((action) => action.semantic === 'upload'),
  });
  policies.set(actions, policy);
  return policy;
};

// WHATWG URL 与 fetch 使用同一套路径规范化规则；声明和最终发送共同核对这条规范路径。
export const normalizeActionTarget = (
  target: string,
  profile: RequestProfile,
  boundary?: RequestAction['target'],
): string => {
  const origin = new URL(profile.domain);
  const resolved = new URL(target, origin);
  if (profile.protocol === 'plain') {
    const allowedOrigin =
      resolved.origin === origin.origin ||
      (resolved.protocol === 'https:' &&
        !resolved.port &&
        profile.allowedHostSuffixes?.some((suffix) =>
          resolved.hostname.endsWith(suffix),
        ));
    if (
      !allowedOrigin ||
      resolved.username ||
      resolved.password ||
      resolved.hash ||
      resolved.protocol !== 'https:'
    ) {
      throw InvalidRequest.make({
        message: 'Plain action target is not allowed',
      });
    }
    const declared = typeof boundary === 'string' ? boundary : boundary?.prefix;
    if (declared !== undefined) {
      const path = new URL(declared, origin).pathname;
      let matches = resolved.pathname === path;
      if (typeof boundary !== 'string') {
        const prefix = path.endsWith('/') ? path : `${path}/`;
        matches ||= resolved.pathname.startsWith(prefix);
      }
      if (!matches)
        throw InvalidRequest.make({
          message: 'Request must match a declared plain action target',
        });
    }
    return resolved.href;
  }
  if (
    !target.startsWith('/api/') ||
    resolved.origin !== origin.origin ||
    resolved.username ||
    resolved.password ||
    resolved.search ||
    resolved.hash ||
    !resolved.pathname.startsWith('/api/')
  ) {
    throw InvalidRequest.make({
      message:
        'Request action target must be an API path without query or fragment',
    });
  }
  const path = resolved.pathname;
  let matches = true;
  if (typeof boundary === 'string') {
    matches = path === boundary;
  } else if (boundary !== undefined) {
    const prefix = boundary.prefix.endsWith('/')
      ? boundary.prefix
      : `${boundary.prefix}/`;
    matches = path === boundary.prefix || path.startsWith(prefix);
  }
  if (!matches) {
    throw InvalidRequest.make({
      message: 'Request must match a declared module action target',
    });
  }
  return path;
};

export const validateModuleActions = (value: unknown): ModuleActions => {
  if (!isRecord(value)) {
    throw InvalidRequest.make({ message: 'moduleActions must be an object' });
  }
  const known = actionSnapshots.get(value);
  if (known) return known;
  const source = value;
  const capturedActions = Object.fromEntries(
    Object.entries(source).map(([name, action]) => {
      if (!isRecord(action)) return [name, action];
      const captured = { ...action };
      // spread 未包含的可选字段仍需校验，且已捕获的 getter 不应再读一次。
      for (const key of ['method', 'response']) {
        if (!Object.hasOwn(captured, key)) {
          const field = action[key];
          if (field !== undefined) captured[key] = field;
        }
      }
      const target = Object.hasOwn(captured, 'target')
        ? captured.target
        : action.target;
      captured.target = isRecord(target) ? { ...target } : target;
      return [name, captured];
    }),
  );
  for (const [name, action] of Object.entries(capturedActions)) {
    if (
      !name ||
      !isRecord(action) ||
      typeof action.profile !== 'string' ||
      !Object.hasOwn(requestProfiles, action.profile) ||
      !(typeof action.target === 'string'
        ? action.target.startsWith('/')
        : isRecord(action.target) &&
          typeof action.target.prefix === 'string' &&
          action.target.prefix.startsWith('/')) ||
      typeof action.semantic !== 'string' ||
      !['read', 'write', 'login', 'upload', 'poll'].includes(action.semantic) ||
      typeof action.cache !== 'string' ||
      !['none', 'shared'].includes(action.cache) ||
      typeof action.retry !== 'string' ||
      !['never', 'connect', 'read'].includes(action.retry) ||
      (action.semantic !== 'read' &&
        (action.cache !== 'none' || action.retry !== 'never'))
    ) {
      throw InvalidRequest.make({ message: `Invalid request action: ${name}` });
    }
  }
  // 上面的逐字段校验建立动作合同；复制并冻结后，模块不能在 token 等待期间修改本次声明。
  const actions = capturedActions as ModuleActions;
  for (const action of Object.values(actions)) {
    const boundary =
      typeof action.target === 'string' ? action.target : action.target.prefix;
    const profile = requestProfiles[action.profile];
    if (
      profile.protocol === 'plain' &&
      (!['GET', 'POST', 'PUT', 'HEAD'].includes(action.method ?? '') ||
        !['json', 'text', 'bytes'].includes(action.response ?? ''))
    ) {
      throw InvalidRequest.make({
        message: 'Plain actions require method and response mode',
      });
    }
    if (
      profile.protocol !== 'plain' &&
      ((action.method !== undefined && action.method !== 'POST') ||
        (action.response !== undefined && action.response !== 'json'))
    ) {
      throw InvalidRequest.make({
        message: 'API actions require POST and JSON response mode',
      });
    }
    const normalized = normalizeActionTarget(boundary, profile);
    if (
      (profile.protocol === 'plain'
        ? new URL(normalized).pathname
        : normalized) !== boundary
    ) {
      throw InvalidRequest.make({
        message: 'Declared action target must use a canonical API path',
      });
    }
  }
  const snapshot = Object.freeze(
    Object.fromEntries(
      Object.entries(actions).map(([name, action]) => {
        const target = action.target;
        const frozenTarget =
          typeof target === 'string' ? target : Object.freeze(target);
        return [name, Object.freeze({ ...action, target: frozenTarget })];
      }),
    ),
  );
  actionSnapshots.set(snapshot, snapshot);
  modulePolicy(snapshot);
  return snapshot;
};
