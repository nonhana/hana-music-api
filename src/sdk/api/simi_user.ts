import type { ModuleBody, ModuleInput } from '../../modules/simi_user.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/simi_user.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const simiUser: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'simi_user',
  route: '/simi/user',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SimiUserBody } from '../../modules/simi_user.ts';
export type { ModuleInput as SimiUserInput } from '../../modules/simi_user.ts';
