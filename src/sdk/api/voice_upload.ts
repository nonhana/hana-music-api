import type { ModuleInput } from '../../modules/voice_upload.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voice_upload.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voiceUpload: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voice_upload',
    route: '/voice/upload',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoiceUploadInput } from '../../modules/voice_upload.ts';
