import type { ModuleBody, ModuleInput } from '../../modules/personalized_mv.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized_mv.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalizedMv: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized_mv',
  route: '/personalized/mv',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedMvBody } from '../../modules/personalized_mv.ts';
export type { ModuleInput as PersonalizedMvInput } from '../../modules/personalized_mv.ts';
