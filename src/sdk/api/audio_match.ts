import type { ModuleBody, ModuleInput } from '../../modules/audio_match.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/audio_match.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const audioMatch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'audio_match',
  route: '/audio/match',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AudioMatchBody } from '../../modules/audio_match.ts';
export type { ModuleInput as AudioMatchInput } from '../../modules/audio_match.ts';
