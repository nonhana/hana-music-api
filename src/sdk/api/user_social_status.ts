import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_social_status.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_social_status.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userSocialStatus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_social_status',
  route: '/user/social/status',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserSocialStatusBody } from '../../modules/user_social_status.ts';
export type { ModuleInput as UserSocialStatusInput } from '../../modules/user_social_status.ts';
