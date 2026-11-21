import type { ModuleBody, ModuleInput } from '../../modules/vip_timemachine.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_timemachine.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipTimemachine: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'vip_timemachine',
  route: '/vip/timemachine',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VipTimemachineBody } from '../../modules/vip_timemachine.ts';
export type { ModuleInput as VipTimemachineInput } from '../../modules/vip_timemachine.ts';
