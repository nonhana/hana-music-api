import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_social_status_support.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_social_status_support.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userSocialStatusSupport: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_social_status_support',
  route: '/user/social/status/support',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserSocialStatusSupportBody } from '../../modules/user_social_status_support.ts';
export type { ModuleInput as UserSocialStatusSupportInput } from '../../modules/user_social_status_support.ts';
