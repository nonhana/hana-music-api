import type { ModuleInput } from '../../modules/voicelist_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voicelist_list.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voicelistList: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voicelist_list',
    route: '/voicelist/list',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoicelistListInput } from '../../modules/voicelist_list.ts';
