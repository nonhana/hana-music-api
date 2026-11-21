import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_track_all.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_track_all.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistTrackAll: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_track_all',
  route: '/playlist/track/all',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistTrackAllBody } from '../../modules/playlist_track_all.ts';
export type { ModuleInput as PlaylistTrackAllInput } from '../../modules/playlist_track_all.ts';
