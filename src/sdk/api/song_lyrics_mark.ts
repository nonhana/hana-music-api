import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_lyrics_mark.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_lyrics_mark.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songLyricsMark: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_lyrics_mark',
  route: '/song/lyrics/mark',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongLyricsMarkBody } from '../../modules/song_lyrics_mark.ts';
export type { ModuleInput as SongLyricsMarkInput } from '../../modules/song_lyrics_mark.ts';
