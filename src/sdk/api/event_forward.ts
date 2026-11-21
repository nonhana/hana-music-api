import type { ModuleInput } from '../../modules/event_forward.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/event_forward.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const eventForward: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'event_forward',
    route: '/event/forward',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as EventForwardInput } from '../../modules/event_forward.ts';
