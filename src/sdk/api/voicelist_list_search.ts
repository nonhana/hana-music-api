import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/voicelist_list_search.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voicelist_list_search.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voicelistListSearch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'voicelist_list_search',
  route: '/voicelist/list/search',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VoicelistListSearchBody } from '../../modules/voicelist_list_search.ts';
export type { ModuleInput as VoicelistListSearchInput } from '../../modules/voicelist_list_search.ts';
