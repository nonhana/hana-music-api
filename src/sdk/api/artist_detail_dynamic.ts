import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/artist_detail_dynamic.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artist_detail_dynamic.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artistDetailDynamic: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artist_detail_dynamic',
  route: '/artist/detail/dynamic',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistDetailDynamicBody } from '../../modules/artist_detail_dynamic.ts';
export type { ModuleInput as ArtistDetailDynamicInput } from '../../modules/artist_detail_dynamic.ts';
