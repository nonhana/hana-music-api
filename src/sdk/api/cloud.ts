import type { ModuleInput } from '../../modules/cloud.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/cloud.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const cloud: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'cloud',
    route: '/cloud',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as CloudInput } from '../../modules/cloud.ts';
