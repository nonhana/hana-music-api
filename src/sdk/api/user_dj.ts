import type { ModuleBody, ModuleInput } from '../../modules/user_dj.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_dj.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userDj: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_dj',
  route: '/user/dj',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserDjBody } from '../../modules/user_dj.ts';
export type { ModuleInput as UserDjInput } from '../../modules/user_dj.ts';
