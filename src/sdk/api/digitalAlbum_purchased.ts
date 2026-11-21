import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/digitalAlbum_purchased.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/digitalAlbum_purchased.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const digitalAlbumPurchased: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'digitalAlbum_purchased',
  route: '/digitalAlbum/purchased',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DigitalAlbumPurchasedBody } from '../../modules/digitalAlbum_purchased.ts';
export type { ModuleInput as DigitalAlbumPurchasedInput } from '../../modules/digitalAlbum_purchased.ts';
