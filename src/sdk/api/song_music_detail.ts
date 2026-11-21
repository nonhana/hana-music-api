import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_music_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_music_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songMusicDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_music_detail',
  route: '/song/music/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongMusicDetailBody } from '../../modules/song_music_detail.ts';
export type { ModuleInput as SongMusicDetailInput } from '../../modules/song_music_detail.ts';
