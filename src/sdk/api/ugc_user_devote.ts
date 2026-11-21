import type { ModuleBody, ModuleInput } from '../../modules/ugc_user_devote.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_user_devote.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcUserDevote: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_user_devote',
  route: '/ugc/user/devote',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcUserDevoteBody } from '../../modules/ugc_user_devote.ts';
export type { ModuleInput as UgcUserDevoteInput } from '../../modules/ugc_user_devote.ts';
