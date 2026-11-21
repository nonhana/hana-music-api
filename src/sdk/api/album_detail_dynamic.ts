import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/album_detail_dynamic.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_detail_dynamic.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumDetailDynamic: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_detail_dynamic',
  route: '/album/detail/dynamic',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumDetailDynamicBody } from '../../modules/album_detail_dynamic.ts';
export type { ModuleInput as AlbumDetailDynamicInput } from '../../modules/album_detail_dynamic.ts';
