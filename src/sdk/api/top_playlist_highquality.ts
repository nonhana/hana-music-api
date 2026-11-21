import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/top_playlist_highquality.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_playlist_highquality.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topPlaylistHighquality: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_playlist_highquality',
  route: '/top/playlist/highquality',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopPlaylistHighqualityBody } from '../../modules/top_playlist_highquality.ts';
export type { ModuleInput as TopPlaylistHighqualityInput } from '../../modules/top_playlist_highquality.ts';
