import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/personalized_djprogram.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized_djprogram.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalizedDjprogram: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized_djprogram',
  route: '/personalized/djprogram',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedDjprogramBody } from '../../modules/personalized_djprogram.ts';
export type { ModuleInput as PersonalizedDjprogramInput } from '../../modules/personalized_djprogram.ts';
