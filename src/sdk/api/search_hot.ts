import type { ModuleBody, ModuleInput } from '../../modules/search_hot.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_hot.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchHot: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_hot',
  route: '/search/hot',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchHotBody } from '../../modules/search_hot.ts';
export type { ModuleInput as SearchHotInput } from '../../modules/search_hot.ts';
