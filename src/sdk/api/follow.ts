import type { ModuleBody, ModuleInput } from '../../modules/follow.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/follow.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const follow: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'follow',
  route: '/follow',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as FollowBody } from '../../modules/follow.ts';
export type { ModuleInput as FollowInput } from '../../modules/follow.ts';
