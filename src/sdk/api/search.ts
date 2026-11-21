import type { ModuleBody, ModuleInput } from '../../modules/search.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const search: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search',
  route: '/search',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchBody } from '../../modules/search.ts';
export type { ModuleInput as SearchInput } from '../../modules/search.ts';
