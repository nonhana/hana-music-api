import type { ModuleInput } from '../../modules/activate_init_profile.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/activate_init_profile.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const activateInitProfile: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'activate_init_profile',
    route: '/activate/init/profile',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as ActivateInitProfileInput } from '../../modules/activate_init_profile.ts';
