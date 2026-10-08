import { Context, Effect } from 'effect';

import type { RuntimeState } from '../types/index.ts';
import { DeadlineExceeded } from './errors.ts';
import { normalizeFailure } from './response.ts';
import { generateDeviceId, generateRandomChineseIP } from './utils.ts';

// 运行时状态只放内存：SDK 可能跑在随时回收的云函数里，匿名令牌由首次调用注册；需要持久化的 CLI 自行读写文件。
let runtimeState: RuntimeState = {
  anonymousToken: '',
  cnIp: generateRandomChineseIP(),
  deviceId: generateDeviceId(),
};

export const getRuntimeState = (
  overrides: Partial<RuntimeState> = {},
): RuntimeState => ({
  ...runtimeState,
  ...overrides,
});

export const setRuntimeState = (
  nextState: Partial<RuntimeState>,
): RuntimeState => {
  runtimeState = {
    ...runtimeState,
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
