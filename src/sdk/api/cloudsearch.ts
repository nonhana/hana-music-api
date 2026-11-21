import type { ModuleBody, ModuleInput } from '../../modules/cloudsearch.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/cloudsearch.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const cloudsearch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'cloudsearch',
  route: '/cloudsearch',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CloudsearchBody } from '../../modules/cloudsearch.ts';
export type { ModuleInput as CloudsearchInput } from '../../modules/cloudsearch.ts';
