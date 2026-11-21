import type { ModuleBody, ModuleInput } from '../../modules/user_binding.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_binding.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userBinding: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_binding',
  route: '/user/binding',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserBindingBody } from '../../modules/user_binding.ts';
export type { ModuleInput as UserBindingInput } from '../../modules/user_binding.ts';
