import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_catlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_catlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistCatlist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_catlist',
  route: '/playlist/catlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistCatlistBody } from '../../modules/playlist_catlist.ts';
export type { ModuleInput as PlaylistCatlistInput } from '../../modules/playlist_catlist.ts';
