import type { ModuleInput } from '../../modules/voice_delete.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voice_delete.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voiceDelete: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voice_delete',
    route: '/voice/delete',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoiceDeleteInput } from '../../modules/voice_delete.ts';
