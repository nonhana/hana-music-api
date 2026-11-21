import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/search_multimatch.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_multimatch.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchMultimatch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_multimatch',
  route: '/search/multimatch',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchMultimatchBody } from '../../modules/search_multimatch.ts';
export type { ModuleInput as SearchMultimatchInput } from '../../modules/search_multimatch.ts';
