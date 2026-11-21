import type { ModuleInput } from '../../modules/login.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const login: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'login',
    route: '/login',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as LoginInput } from '../../modules/login.ts';
