import type { RequestIntent } from '../types/index.ts';
import { InvalidRequest } from './errors.ts';
import { requestProfiles } from './request-profiles.ts';
import type { RequestProfile, RequestProfileName } from './request-profiles.ts';
import { isRecord } from './utils.ts';

export interface RequestAction {
  readonly profile: RequestProfileName;
  readonly target: string | { readonly prefix: string };
  readonly semantic: RequestIntent['semantic'];
  readonly token: 'none' | 'optional' | 'required';
  readonly cache: 'none' | 'shared';
  readonly retry: 'never' | 'connect' | 'read';
}

export type ModuleActions = Readonly<Record<string, RequestAction>>;

// WHATWG URL 与 fetch 使用同一套路径规范化规则；声明和最终发送共同核对这条规范路径。
export const normalizeActionTarget = (
  target: string,
  profile: RequestProfile,
  boundary?: RequestAction['target'],
): string => {
  const origin = new URL(profile.domain);
  const resolved = new URL(target, origin);
  if (
    !target.startsWith('/api/') ||
    resolved.origin !== origin.origin ||
    resolved.username ||
    resolved.password ||
    resolved.search ||
    resolved.hash ||
    !resolved.pathname.startsWith('/api/')
  ) {
    throw new InvalidRequest({
      message:
        'Request action target must be an API path without query or fragment',
    });
  }
  const path = resolved.pathname;
  const matches =
    boundary === undefined ||
    (typeof boundary === 'string'
      ? path === boundary
      : boundary.prefix.endsWith('/')
        ? path.startsWith(boundary.prefix)
        : path === boundary.prefix || path.startsWith(`${boundary.prefix}/`));
  if (!matches) {
    throw new InvalidRequest({
      message: 'Request must match a declared module action target',
    });
  }
  return path;
};

export const validateModuleActions = (value: unknown): ModuleActions => {
  if (!isRecord(value)) {
    throw new InvalidRequest({ message: 'moduleActions must be an object' });
  }
  for (const [name, action] of Object.entries(value)) {
    if (
      !name ||
      !isRecord(action) ||
      typeof action.profile !== 'string' ||
      !Object.hasOwn(requestProfiles, action.profile) ||
      !(typeof action.target === 'string'
        ? action.target.startsWith('/api/')
        : isRecord(action.target) &&
          typeof action.target.prefix === 'string' &&
          action.target.prefix.startsWith('/api/')) ||
      !['read', 'write', 'login', 'upload', 'poll'].includes(
        String(action.semantic),
      ) ||
      !['none', 'optional', 'required'].includes(String(action.token)) ||
      !['none', 'shared'].includes(String(action.cache)) ||
      !['never', 'connect', 'read'].includes(String(action.retry)) ||
      (action.semantic !== 'read' &&
        (action.cache !== 'none' || action.retry !== 'never'))
    ) {
      throw new InvalidRequest({ message: `Invalid request action: ${name}` });
    }
  }
  // 上面的逐字段校验建立动作合同；复制并冻结后，模块不能在 token 等待期间修改本次声明。
  const actions = value as ModuleActions;
  for (const action of Object.values(actions)) {
    const boundary =
      typeof action.target === 'string' ? action.target : action.target.prefix;
    if (
      normalizeActionTarget(boundary, requestProfiles[action.profile]) !==
      boundary
    ) {
      throw new InvalidRequest({
        message: 'Declared action target must use a canonical API path',
      });
    }
  }
  return Object.freeze(
    Object.fromEntries(
      Object.entries(actions).map(([name, action]) => [
        name,
        Object.freeze({
          ...action,
          target:
            typeof action.target === 'string'
              ? action.target
              : Object.freeze({ ...action.target }),
        }),
      ]),
    ),
  );
};
