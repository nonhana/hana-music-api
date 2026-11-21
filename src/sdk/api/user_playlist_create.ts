import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_playlist_create.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_playlist_create.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userPlaylistCreate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_playlist_create',
  route: '/user/playlist/create',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserPlaylistCreateBody } from '../../modules/user_playlist_create.ts';
export type { ModuleInput as UserPlaylistCreateInput } from '../../modules/user_playlist_create.ts';
