import type { ModuleBody, ModuleInput } from '../../modules/logout.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/logout.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const logout: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'logout',
  route: '/logout',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LogoutBody } from '../../modules/logout.ts';
export type { ModuleInput as LogoutInput } from '../../modules/logout.ts';
