import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_detail_rcmd_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_detail_rcmd_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistDetailRcmdGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_detail_rcmd_get',
  route: '/playlist/detail/rcmd/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistDetailRcmdGetBody } from '../../modules/playlist_detail_rcmd_get.ts';
export type { ModuleInput as PlaylistDetailRcmdGetInput } from '../../modules/playlist_detail_rcmd_get.ts';
