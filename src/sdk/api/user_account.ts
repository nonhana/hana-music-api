import type { ModuleBody, ModuleInput } from '../../modules/user_account.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_account.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userAccount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_account',
  route: '/user/account',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserAccountBody } from '../../modules/user_account.ts';
export type { ModuleInput as UserAccountInput } from '../../modules/user_account.ts';
