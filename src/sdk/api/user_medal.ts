import type { ModuleBody, ModuleInput } from '../../modules/user_medal.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_medal.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userMedal: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_medal',
  route: '/user/medal',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserMedalBody } from '../../modules/user_medal.ts';
export type { ModuleInput as UserMedalInput } from '../../modules/user_medal.ts';
