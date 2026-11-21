import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_track_add.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_track_add.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistTrackAdd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_track_add',
  route: '/playlist/track/add',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistTrackAddBody } from '../../modules/playlist_track_add.ts';
export type { ModuleInput as PlaylistTrackAddInput } from '../../modules/playlist_track_add.ts';
