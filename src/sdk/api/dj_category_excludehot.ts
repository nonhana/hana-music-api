import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_category_excludehot.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_category_excludehot.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djCategoryExcludehot: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_category_excludehot',
  route: '/dj/category/excludehot',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjCategoryExcludehotBody } from '../../modules/dj_category_excludehot.ts';
export type { ModuleInput as DjCategoryExcludehotInput } from '../../modules/dj_category_excludehot.ts';
