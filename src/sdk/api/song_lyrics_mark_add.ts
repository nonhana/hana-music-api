import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_lyrics_mark_add.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_lyrics_mark_add.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songLyricsMarkAdd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_lyrics_mark_add',
  route: '/song/lyrics/mark/add',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongLyricsMarkAddBody } from '../../modules/song_lyrics_mark_add.ts';
export type { ModuleInput as SongLyricsMarkAddInput } from '../../modules/song_lyrics_mark_add.ts';
