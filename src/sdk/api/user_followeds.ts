import type { ModuleBody, ModuleInput } from '../../modules/user_followeds.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_followeds.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userFolloweds: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_followeds',
  route: '/user/followeds',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserFollowedsBody } from '../../modules/user_followeds.ts';
export type { ModuleInput as UserFollowedsInput } from '../../modules/user_followeds.ts';
