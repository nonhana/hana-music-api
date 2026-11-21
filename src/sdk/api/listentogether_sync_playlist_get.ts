import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_sync_playlist_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_sync_playlist_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherSyncPlaylistGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_sync_playlist_get',
  route: '/listentogether/sync/playlist/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherSyncPlaylistGetBody } from '../../modules/listentogether_sync_playlist_get.ts';
export type { ModuleInput as ListentogetherSyncPlaylistGetInput } from '../../modules/listentogether_sync_playlist_get.ts';
