import type { ModuleBody, ModuleInput } from '../../modules/vip_info_v2.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_info_v2.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipInfoV2: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'vip_info_v2',
  route: '/vip/info/v2',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VipInfoV2Body } from '../../modules/vip_info_v2.ts';
export type { ModuleInput as VipInfoV2Input } from '../../modules/vip_info_v2.ts';
