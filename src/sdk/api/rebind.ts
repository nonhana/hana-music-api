import type { ModuleInput } from '../../modules/rebind.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/rebind.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const rebind: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'rebind',
    route: '/rebind',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as RebindInput } from '../../modules/rebind.ts';
