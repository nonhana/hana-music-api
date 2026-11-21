import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_update_playcount.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_update_playcount.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistUpdatePlaycount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_update_playcount',
  route: '/playlist/update/playcount',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistUpdatePlaycountBody } from '../../modules/playlist_update_playcount.ts';
export type { ModuleInput as PlaylistUpdatePlaycountInput } from '../../modules/playlist_update_playcount.ts';
