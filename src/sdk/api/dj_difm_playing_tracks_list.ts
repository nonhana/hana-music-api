import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_difm_playing_tracks_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_difm_playing_tracks_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djDifmPlayingTracksList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_difm_playing_tracks_list',
  route: '/dj/difm/playing/tracks/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjDifmPlayingTracksListBody } from '../../modules/dj_difm_playing_tracks_list.ts';
export type { ModuleInput as DjDifmPlayingTracksListInput } from '../../modules/dj_difm_playing_tracks_list.ts';
