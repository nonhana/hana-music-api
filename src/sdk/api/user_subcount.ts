import type { ModuleBody, ModuleInput } from '../../modules/user_subcount.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_subcount.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userSubcount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_subcount',
  route: '/user/subcount',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserSubcountBody } from '../../modules/user_subcount.ts';
export type { ModuleInput as UserSubcountInput } from '../../modules/user_subcount.ts';
