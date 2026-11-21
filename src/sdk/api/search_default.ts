import type { ModuleBody, ModuleInput } from '../../modules/search_default.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/search_default.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const searchDefault: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'search_default',
  route: '/search/default',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SearchDefaultBody } from '../../modules/search_default.ts';
export type { ModuleInput as SearchDefaultInput } from '../../modules/search_default.ts';
