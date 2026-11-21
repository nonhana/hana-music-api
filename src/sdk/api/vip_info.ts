import type { ModuleBody, ModuleInput } from '../../modules/vip_info.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/vip_info.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const vipInfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'vip_info',
  route: '/vip/info',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VipInfoBody } from '../../modules/vip_info.ts';
export type { ModuleInput as VipInfoInput } from '../../modules/vip_info.ts';
