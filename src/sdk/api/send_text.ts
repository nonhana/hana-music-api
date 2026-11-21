import type { ModuleInput } from '../../modules/send_text.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/send_text.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sendText: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'send_text',
    route: '/send/text',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as SendTextInput } from '../../modules/send_text.ts';
