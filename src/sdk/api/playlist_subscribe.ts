import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_subscribe.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_subscribe.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistSubscribe: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_subscribe',
  route: '/playlist/subscribe',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistSubscribeBody } from '../../modules/playlist_subscribe.ts';
export type { ModuleInput as PlaylistSubscribeInput } from '../../modules/playlist_subscribe.ts';
