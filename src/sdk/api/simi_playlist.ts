import type { ModuleBody, ModuleInput } from '../../modules/simi_playlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/simi_playlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const simiPlaylist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'simi_playlist',
  route: '/simi/playlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SimiPlaylistBody } from '../../modules/simi_playlist.ts';
export type { ModuleInput as SimiPlaylistInput } from '../../modules/simi_playlist.ts';
