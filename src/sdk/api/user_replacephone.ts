import type { ModuleInput } from '../../modules/user_replacephone.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_replacephone.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userReplacephone: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'user_replacephone',
    route: '/user/replacephone',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as UserReplacephoneInput } from '../../modules/user_replacephone.ts';
