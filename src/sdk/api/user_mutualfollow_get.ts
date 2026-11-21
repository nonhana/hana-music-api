import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_mutualfollow_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_mutualfollow_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userMutualfollowGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_mutualfollow_get',
  route: '/user/mutualfollow/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserMutualfollowGetBody } from '../../modules/user_mutualfollow_get.ts';
export type { ModuleInput as UserMutualfollowGetInput } from '../../modules/user_mutualfollow_get.ts';
