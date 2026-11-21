import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/vip_growthpoint_details.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_growthpoint_details.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipGrowthpointDetails: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'vip_growthpoint_details',
  route: '/vip/growthpoint/details',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VipGrowthpointDetailsBody } from '../../modules/vip_growthpoint_details.ts';
export type { ModuleInput as VipGrowthpointDetailsInput } from '../../modules/vip_growthpoint_details.ts';
