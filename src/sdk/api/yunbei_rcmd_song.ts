import type { ModuleInput } from '../../modules/yunbei_rcmd_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_rcmd_song.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiRcmdSong: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'yunbei_rcmd_song',
    route: '/yunbei/rcmd/song',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as YunbeiRcmdSongInput } from '../../modules/yunbei_rcmd_song.ts';
