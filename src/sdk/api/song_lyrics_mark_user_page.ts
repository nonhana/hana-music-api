import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_lyrics_mark_user_page.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_lyrics_mark_user_page.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songLyricsMarkUserPage: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_lyrics_mark_user_page',
  route: '/song/lyrics/mark/user/page',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongLyricsMarkUserPageBody } from '../../modules/song_lyrics_mark_user_page.ts';
export type { ModuleInput as SongLyricsMarkUserPageInput } from '../../modules/song_lyrics_mark_user_page.ts';
