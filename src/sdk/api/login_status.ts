import type { ModuleBody, ModuleInput } from '../../modules/login_status.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login_status.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const loginStatus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'login_status',
  route: '/login/status',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LoginStatusBody } from '../../modules/login_status.ts';
export type { ModuleInput as LoginStatusInput } from '../../modules/login_status.ts';
