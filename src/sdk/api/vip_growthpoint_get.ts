import type { ModuleInput } from '../../modules/vip_growthpoint_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_growthpoint_get.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipGrowthpointGet: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'vip_growthpoint_get',
    route: '/vip/growthpoint/get',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VipGrowthpointGetInput } from '../../modules/vip_growthpoint_get.ts';
