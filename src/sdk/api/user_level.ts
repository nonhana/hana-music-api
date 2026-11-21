import type { ModuleBody, ModuleInput } from '../../modules/user_level.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_level.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userLevel: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_level',
  route: '/user/level',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserLevelBody } from '../../modules/user_level.ts';
export type { ModuleInput as UserLevelInput } from '../../modules/user_level.ts';
