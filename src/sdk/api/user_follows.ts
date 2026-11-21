import type { ModuleBody, ModuleInput } from '../../modules/user_follows.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_follows.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userFollows: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_follows',
  route: '/user/follows',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserFollowsBody } from '../../modules/user_follows.ts';
export type { ModuleInput as UserFollowsInput } from '../../modules/user_follows.ts';
