import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_toplist_popular.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_toplist_popular.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djToplistPopular: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_toplist_popular',
  route: '/dj/toplist/popular',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjToplistPopularBody } from '../../modules/dj_toplist_popular.ts';
export type { ModuleInput as DjToplistPopularInput } from '../../modules/dj_toplist_popular.ts';
