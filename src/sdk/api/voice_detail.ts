import type { ModuleInput } from '../../modules/voice_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voice_detail.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voiceDetail: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voice_detail',
    route: '/voice/detail',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoiceDetailInput } from '../../modules/voice_detail.ts';
