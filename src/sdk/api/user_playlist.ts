import type { ModuleBody, ModuleInput } from '../../modules/user_playlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_playlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userPlaylist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_playlist',
  route: '/user/playlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserPlaylistBody } from '../../modules/user_playlist.ts';
export type { ModuleInput as UserPlaylistInput } from '../../modules/user_playlist.ts';
