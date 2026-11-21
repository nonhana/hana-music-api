import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/yunbei_rcmd_song_history.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_rcmd_song_history.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiRcmdSongHistory: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'yunbei_rcmd_song_history',
  route: '/yunbei/rcmd/song/history',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as YunbeiRcmdSongHistoryBody } from '../../modules/yunbei_rcmd_song_history.ts';
export type { ModuleInput as YunbeiRcmdSongHistoryInput } from '../../modules/yunbei_rcmd_song_history.ts';
