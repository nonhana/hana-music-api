import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_playlist_collect.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_playlist_collect.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userPlaylistCollect: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_playlist_collect',
  route: '/user/playlist/collect',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserPlaylistCollectBody } from '../../modules/user_playlist_collect.ts';
export type { ModuleInput as UserPlaylistCollectInput } from '../../modules/user_playlist_collect.ts';
