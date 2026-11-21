import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_video_recent.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_video_recent.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistVideoRecent: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_video_recent',
  route: '/playlist/video/recent',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistVideoRecentBody } from '../../modules/playlist_video_recent.ts';
export type { ModuleInput as PlaylistVideoRecentInput } from '../../modules/playlist_video_recent.ts';
