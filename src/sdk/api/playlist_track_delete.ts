import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_track_delete.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_track_delete.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistTrackDelete: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_track_delete',
  route: '/playlist/track/delete',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistTrackDeleteBody } from '../../modules/playlist_track_delete.ts';
export type { ModuleInput as PlaylistTrackDeleteInput } from '../../modules/playlist_track_delete.ts';
