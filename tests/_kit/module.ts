import { Effect } from 'effect';

import { buildCallServices, Call, runCall } from '../../src/core/call.ts';
import { decodeModuleObject } from '../../src/core/module-input.ts';
import type { ModuleActions } from '../../src/core/request-actions.ts';
import { runRequestAtEdge } from '../../src/core/request.ts';
import type {
  ModuleCallConfig,
  ModuleEffect,
  ModuleQuery,
  NcmApiResponse,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';

// 模块返回体的类型由调用点决定：mock 本体是 legacy 响应，测试里要断言成具体 Body。
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const moduleResponse = <Body = UnknownJson>(
  response: NcmApiResponse,
): NcmApiResponse<Body> => ({ ...response, body: response.body as Body });

export type RecordedAction = {
  readonly action: string;
  readonly args: Parameters<RequestCapability>[1];
};

export const testRequest = (
  request: RequestCapability,
  uri: string,
  data: Record<string, unknown> = {},
  options: { readonly headers?: Readonly<Record<string, string>> } = {},
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const selected = Object.entries(call.actions).find(
      ([, action]) => action.target === uri,
    );
    if (!selected)
      throw new Error(`Test must declare its request action: ${uri}`);
    const [name] = selected;
    const response = yield* request(name, { data, headers: options.headers });
    return {
      status: response.status,
      cookie: [...response.cookie],
      body: response.body,
    };
  });

export const testPlainRequest = (
  request: RequestCapability,
  url: string,
  options: { method?: string } = {},
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const selected = Object.entries(call.actions).find(
      ([, action]) => action.method === (options.method ?? 'GET'),
    );
    if (!selected)
      throw new Error(`Test must declare its plain action: ${url}`);
    const [name, action] = selected;
    return yield* request(
      name,
      typeof action.target === 'string'
        ? {
            query: url.includes('?')
              ? url.slice(url.indexOf('?') + 1)
              : undefined,
          }
        : { target: url },
    );
  });

export const plainRequest = (options: ModuleCallConfig) => (url: string) =>
  runRequestAtEdge(
    {
      target: url,
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'bytes',
    },
    options,
  );

export const moduleRuntime = (
  ttlMs: number | null = 120_000,
  actions: ModuleActions = {
    request: {
      profile: 'api',
      target: '/api/search/get',
      semantic: 'read',
      cache: 'shared',
      retry: 'read',
    },
  },
) => {
  // shape 值直接持有（服务集无 scope 资源），供 runCall 与快照读取共用。
  const scoped = buildCallServices(
    { cache: ttlMs === null ? { enabled: false } : { ttlMs } },
    false,
  );
  const services = scoped;
  return {
    get snapshot() {
      return scoped.reads.snapshot;
    },
    invoke: (
      identifier: string,
      execute: ModuleEffect<ModuleQuery>,
      input: ModuleQuery,
      config: ModuleCallConfig = {},
    ) =>
      runCall({ identifier, input, config }, services, {
        identifier,
        actions,
        route: '/' + identifier,
        decodeInput: decodeModuleObject,
        execute,
      }),
  };
};

// 显式测试合同只服务探针，不借真实业务模块的配置覆盖协议或策略。
export const probeReadActions = {
  example: {
    profile: 'api',
    target: '/api/example',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
  read: {
    profile: 'api',
    target: '/api/search/get',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
  test: {
    profile: 'api',
    target: '/api/test',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;
export const probeWriteActions = {
  like: {
    profile: 'api',
    target: '/api/like',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  radio: {
    profile: 'web',
    target: '/api/radio/like',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;
export const probeUploadActions = {
  token: {
    profile: 'api',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  part: {
    profile: 'plainVoice',
    target: '/test',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'PUT',
    response: 'bytes',
  },
} as const satisfies ModuleActions;
