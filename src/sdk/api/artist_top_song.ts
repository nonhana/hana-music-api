import type { ModuleBody, ModuleInput } from '../../modules/artist_top_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artist_top_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artistTopSong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artist_top_song',
  route: '/artist/top/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistTopSongBody } from '../../modules/artist_top_song.ts';
export type { ModuleInput as ArtistTopSongInput } from '../../modules/artist_top_song.ts';
