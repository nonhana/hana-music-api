import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_order_update.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_order_update.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songOrderUpdate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_order_update',
  route: '/song/order/update',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongOrderUpdateBody } from '../../modules/song_order_update.ts';
export type { ModuleInput as SongOrderUpdateInput } from '../../modules/song_order_update.ts';
