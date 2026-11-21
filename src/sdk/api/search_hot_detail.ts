import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/search_hot_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_hot_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchHotDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_hot_detail',
  route: '/search/hot/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchHotDetailBody } from '../../modules/search_hot_detail.ts';
export type { ModuleInput as SearchHotDetailInput } from '../../modules/search_hot_detail.ts';
