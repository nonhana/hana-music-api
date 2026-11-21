import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_recommend_type.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_recommend_type.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djRecommendType: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_recommend_type',
  route: '/dj/recommend/type',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjRecommendTypeBody } from '../../modules/dj_recommend_type.ts';
export type { ModuleInput as DjRecommendTypeInput } from '../../modules/dj_recommend_type.ts';
