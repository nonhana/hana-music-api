import type { ModuleBody, ModuleInput } from '../../modules/style_album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/style_album.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const styleAlbum: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'style_album',
  route: '/style/album',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StyleAlbumBody } from '../../modules/style_album.ts';
export type { ModuleInput as StyleAlbumInput } from '../../modules/style_album.ts';
