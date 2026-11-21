import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_detail_dynamic.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_detail_dynamic.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistDetailDynamic: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_detail_dynamic',
  route: '/playlist/detail/dynamic',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistDetailDynamicBody } from '../../modules/playlist_detail_dynamic.ts';
export type { ModuleInput as PlaylistDetailDynamicInput } from '../../modules/playlist_detail_dynamic.ts';
