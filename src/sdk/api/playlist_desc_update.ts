import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_desc_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_desc_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistDescUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_desc_update',
  route: '/playlist/desc/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistDescUpdateBody } from '../../modules/playlist_desc_update.ts';
export type { ModuleInput as PlaylistDescUpdateInput } from '../../modules/playlist_desc_update.ts';
