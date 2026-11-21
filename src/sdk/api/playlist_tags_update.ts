import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_tags_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_tags_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistTagsUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_tags_update',
  route: '/playlist/tags/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistTagsUpdateBody } from '../../modules/playlist_tags_update.ts';
export type { ModuleInput as PlaylistTagsUpdateInput } from '../../modules/playlist_tags_update.ts';
