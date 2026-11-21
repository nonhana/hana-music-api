import type { ModuleBody, ModuleInput } from '../../modules/signin_progress.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/signin_progress.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const signinProgress: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'signin_progress',
  route: '/signin/progress',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SigninProgressBody } from '../../modules/signin_progress.ts';
export type { ModuleInput as SigninProgressInput } from '../../modules/signin_progress.ts';
