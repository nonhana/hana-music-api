import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_highquality_tags.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_highquality_tags.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistHighqualityTags: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_highquality_tags',
  route: '/playlist/highquality/tags',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistHighqualityTagsBody } from '../../modules/playlist_highquality_tags.ts';
export type { ModuleInput as PlaylistHighqualityTagsInput } from '../../modules/playlist_highquality_tags.ts';
