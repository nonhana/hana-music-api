import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/voicelist_search.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voicelist_search.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voicelistSearch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'voicelist_search',
  route: '/voicelist/search',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VoicelistSearchBody } from '../../modules/voicelist_search.ts';
export type { ModuleInput as VoicelistSearchInput } from '../../modules/voicelist_search.ts';
