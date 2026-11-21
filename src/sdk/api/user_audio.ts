import type { ModuleBody, ModuleInput } from '../../modules/user_audio.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_audio.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userAudio: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_audio',
  route: '/user/audio',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserAudioBody } from '../../modules/user_audio.ts';
export type { ModuleInput as UserAudioInput } from '../../modules/user_audio.ts';
