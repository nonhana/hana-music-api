import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_social_status_rcmd.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_social_status_rcmd.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userSocialStatusRcmd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_social_status_rcmd',
  route: '/user/social/status/rcmd',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserSocialStatusRcmdBody } from '../../modules/user_social_status_rcmd.ts';
export type { ModuleInput as UserSocialStatusRcmdInput } from '../../modules/user_social_status_rcmd.ts';
