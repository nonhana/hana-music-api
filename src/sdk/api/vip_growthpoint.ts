import type { ModuleBody, ModuleInput } from '../../modules/vip_growthpoint.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_growthpoint.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipGrowthpoint: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'vip_growthpoint',
  route: '/vip/growthpoint',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VipGrowthpointBody } from '../../modules/vip_growthpoint.ts';
export type { ModuleInput as VipGrowthpointInput } from '../../modules/vip_growthpoint.ts';
