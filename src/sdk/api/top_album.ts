import type { ModuleBody, ModuleInput } from '../../modules/top_album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_album.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topAlbum: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_album',
  route: '/top/album',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopAlbumBody } from '../../modules/top_album.ts';
export type { ModuleInput as TopAlbumInput } from '../../modules/top_album.ts';
