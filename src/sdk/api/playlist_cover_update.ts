import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_cover_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_cover_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistCoverUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_cover_update',
  route: '/playlist/cover/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistCoverUpdateBody } from '../../modules/playlist_cover_update.ts';
export type { ModuleInput as PlaylistCoverUpdateInput } from '../../modules/playlist_cover_update.ts';
