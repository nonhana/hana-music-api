import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_category_recommend.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_category_recommend.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djCategoryRecommend: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_category_recommend',
  route: '/dj/category/recommend',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjCategoryRecommendBody } from '../../modules/dj_category_recommend.ts';
export type { ModuleInput as DjCategoryRecommendInput } from '../../modules/dj_category_recommend.ts';
