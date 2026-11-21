import type { ModuleInput } from '../../modules/share_resource.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/share_resource.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const shareResource: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'share_resource',
    route: '/share/resource',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as ShareResourceInput } from '../../modules/share_resource.ts';
