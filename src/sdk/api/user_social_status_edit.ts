import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_social_status_edit.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_social_status_edit.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userSocialStatusEdit: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_social_status_edit',
  route: '/user/social/status/edit',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserSocialStatusEditBody } from '../../modules/user_social_status_edit.ts';
export type { ModuleInput as UserSocialStatusEditInput } from '../../modules/user_social_status_edit.ts';
