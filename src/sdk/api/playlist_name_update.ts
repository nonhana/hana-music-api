import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_name_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_name_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistNameUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_name_update',
  route: '/playlist/name/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistNameUpdateBody } from '../../modules/playlist_name_update.ts';
export type { ModuleInput as PlaylistNameUpdateInput } from '../../modules/playlist_name_update.ts';
