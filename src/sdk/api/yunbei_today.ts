import type { ModuleBody, ModuleInput } from '../../modules/yunbei_today.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_today.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiToday: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'yunbei_today',
  route: '/yunbei/today',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as YunbeiTodayBody } from '../../modules/yunbei_today.ts';
export type { ModuleInput as YunbeiTodayInput } from '../../modules/yunbei_today.ts';
