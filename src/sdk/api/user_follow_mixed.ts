import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_follow_mixed.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_follow_mixed.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userFollowMixed: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_follow_mixed',
  route: '/user/follow/mixed',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserFollowMixedBody } from '../../modules/user_follow_mixed.ts';
export type { ModuleInput as UserFollowMixedInput } from '../../modules/user_follow_mixed.ts';
