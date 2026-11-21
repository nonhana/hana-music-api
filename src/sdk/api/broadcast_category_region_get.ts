import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/broadcast_category_region_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/broadcast_category_region_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const broadcastCategoryRegionGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'broadcast_category_region_get',
  route: '/broadcast/category/region/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as BroadcastCategoryRegionGetBody } from '../../modules/broadcast_category_region_get.ts';
export type { ModuleInput as BroadcastCategoryRegionGetInput } from '../../modules/broadcast_category_region_get.ts';
