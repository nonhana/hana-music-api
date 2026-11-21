import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_order_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_order_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistOrderUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_order_update',
  route: '/playlist/order/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistOrderUpdateBody } from '../../modules/playlist_order_update.ts';
export type { ModuleInput as PlaylistOrderUpdateInput } from '../../modules/playlist_order_update.ts';
