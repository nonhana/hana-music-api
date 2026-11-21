import type { ModuleBody, ModuleInput } from '../../modules/voice_lyric.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voice_lyric.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voiceLyric: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'voice_lyric',
  route: '/voice/lyric',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VoiceLyricBody } from '../../modules/voice_lyric.ts';
export type { ModuleInput as VoiceLyricInput } from '../../modules/voice_lyric.ts';
