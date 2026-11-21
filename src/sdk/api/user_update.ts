import type { ModuleInput } from '../../modules/user_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_update.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userUpdate: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'user_update',
    route: '/user/update',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as UserUpdateInput } from '../../modules/user_update.ts';
