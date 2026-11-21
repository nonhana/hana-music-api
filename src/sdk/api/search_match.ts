import type { ModuleBody, ModuleInput } from '../../modules/search_match.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_match.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchMatch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_match',
  route: '/search/match',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchMatchBody } from '../../modules/search_match.ts';
export type { ModuleInput as SearchMatchInput } from '../../modules/search_match.ts';
