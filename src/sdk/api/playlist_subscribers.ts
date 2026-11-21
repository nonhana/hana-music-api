import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_subscribers.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_subscribers.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistSubscribers: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_subscribers',
  route: '/playlist/subscribers',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistSubscribersBody } from '../../modules/playlist_subscribers.ts';
export type { ModuleInput as PlaylistSubscribersInput } from '../../modules/playlist_subscribers.ts';
