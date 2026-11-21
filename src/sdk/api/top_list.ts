import type { ModuleBody, ModuleInput } from '../../modules/top_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_list',
  route: '/top/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopListBody } from '../../modules/top_list.ts';
export type { ModuleInput as TopListInput } from '../../modules/top_list.ts';
