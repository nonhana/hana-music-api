import type { ModuleInput } from '../../modules/voicelist_trans.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/voicelist_trans.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const voicelistTrans: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'voicelist_trans',
    route: '/voicelist/trans',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as VoicelistTransInput } from '../../modules/voicelist_trans.ts';
