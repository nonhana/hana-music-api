import type { ModuleBody, ModuleInput } from '../../modules/search_suggest.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_suggest.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchSuggest: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_suggest',
  route: '/search/suggest',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchSuggestBody } from '../../modules/search_suggest.ts';
export type { ModuleInput as SearchSuggestInput } from '../../modules/search_suggest.ts';
