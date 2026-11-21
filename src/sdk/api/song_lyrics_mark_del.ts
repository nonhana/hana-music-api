import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_lyrics_mark_del.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_lyrics_mark_del.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songLyricsMarkDel: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_lyrics_mark_del',
  route: '/song/lyrics/mark/del',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongLyricsMarkDelBody } from '../../modules/song_lyrics_mark_del.ts';
export type { ModuleInput as SongLyricsMarkDelInput } from '../../modules/song_lyrics_mark_del.ts';
