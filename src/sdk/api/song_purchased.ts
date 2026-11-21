import type { ModuleBody, ModuleInput } from '../../modules/song_purchased.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_purchased.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songPurchased: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_purchased',
  route: '/song/purchased',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongPurchasedBody } from '../../modules/song_purchased.ts';
export type { ModuleInput as SongPurchasedInput } from '../../modules/song_purchased.ts';
