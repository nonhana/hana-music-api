import type { ModuleBody, ModuleInput } from '../../modules/personalized.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalized: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized',
  route: '/personalized',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedBody } from '../../modules/personalized.ts';
export type { ModuleInput as PersonalizedInput } from '../../modules/personalized.ts';
