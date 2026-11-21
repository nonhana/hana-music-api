import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/record_recent_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/record_recent_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recordRecentSong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'record_recent_song',
  route: '/record/recent/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecordRecentSongBody } from '../../modules/record_recent_song.ts';
export type { ModuleInput as RecordRecentSongInput } from '../../modules/record_recent_song.ts';
