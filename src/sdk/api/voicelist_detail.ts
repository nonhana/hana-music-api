import type { ModuleInput } from '../../modules/voicelist_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voicelist_detail.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voicelistDetail: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voicelist_detail',
    route: '/voicelist/detail',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoicelistDetailInput } from '../../modules/voicelist_detail.ts';
