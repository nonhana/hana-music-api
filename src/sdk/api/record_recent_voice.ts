import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/record_recent_voice.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/record_recent_voice.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recordRecentVoice: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'record_recent_voice',
  route: '/record/recent/voice',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecordRecentVoiceBody } from '../../modules/record_recent_voice.ts';
export type { ModuleInput as RecordRecentVoiceInput } from '../../modules/record_recent_voice.ts';
