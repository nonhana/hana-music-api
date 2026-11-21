import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';

import type { RuntimeState } from '../types/index.ts';
import { DeadlineExceeded } from './errors.ts';
import { normalizeFailure } from './response.ts';
import { generateDeviceId, generateRandomChineseIP } from './utils.ts';

// 运行时状态只放内存且按需懒初始化：避免模块导入期立即生成随机设备号和 IP，匿名令牌由首次调用注册；需要持久化的 CLI 自行读写文件。
let runtimeState: RuntimeState | undefined;

const ensureRuntimeState = (): RuntimeState => {
  runtimeState ??= {
    anonymousToken: '',
    cnIp: generateRandomChineseIP(),
    deviceId: generateDeviceId(),
  };
  return runtimeState;
};

export const getRuntimeState = (
  overrides: Partial<RuntimeState> = {},
): RuntimeState => ({
  ...ensureRuntimeState(),
  ...overrides,
});

export const setRuntimeState = (
  nextState: Partial<RuntimeState>,
): RuntimeState => {
  runtimeState = {
    ...ensureRuntimeState(),
    ...nextState,
  };

  return runtimeState;
};

export class ProcessServices extends Context.Service<
  ProcessServices,
  { readonly readState: typeof getRuntimeState }
>()('hana-music-api/core/runtime/ProcessServices') {}

export const resolveProcessServices = (): Context.Service.Shape<
  typeof ProcessServices
> => ({ readState: getRuntimeState });

export const runPublicEffect = async <Value, Failure = unknown>(
  // SDK Promise 边界：故意接受任意失败的 Effect 并在 normalizeFailure 中归一化封口。
  work: Effect.Effect<Value, Failure>,
  signal?: AbortSignal,
  failure?: () => unknown,
): Promise<Value> => {
  if (signal?.aborted) {
    // SDK Promise 边界契约：失败以 NcmApiResponse 对象抛出（normalize 后），见 request.ts 同款注释。
    // oxlint-disable-next-line typescript/only-throw-error
    throw normalizeFailure(signal.reason, true);
  }
  try {
    return await Effect.runPromise(work, { signal });
  } catch (error) {
    // oxlint-disable-next-line typescript/only-throw-error
    throw normalizeFailure(
      failure?.() ?? error,
      signal?.aborted,
      error instanceof DeadlineExceeded,
    );
  }
};
