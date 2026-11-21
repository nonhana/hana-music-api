import type { ModuleInput } from '../../modules/batch.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/batch.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const batch: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'batch',
    route: '/batch',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as BatchInput } from '../../modules/batch.ts';
