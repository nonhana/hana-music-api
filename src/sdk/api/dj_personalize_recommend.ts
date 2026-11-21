import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_personalize_recommend.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_personalize_recommend.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djPersonalizeRecommend: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_personalize_recommend',
  route: '/dj/personalize/recommend',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjPersonalizeRecommendBody } from '../../modules/dj_personalize_recommend.ts';
export type { ModuleInput as DjPersonalizeRecommendInput } from '../../modules/dj_personalize_recommend.ts';
