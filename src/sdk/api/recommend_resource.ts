import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/recommend_resource.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/recommend_resource.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recommendResource: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'recommend_resource',
  route: '/recommend/resource',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecommendResourceBody } from '../../modules/recommend_resource.ts';
export type { ModuleInput as RecommendResourceInput } from '../../modules/recommend_resource.ts';
