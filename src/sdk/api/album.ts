import type { ModuleBody, ModuleInput } from '../../modules/album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const album: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album',
  route: '/album',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumBody } from '../../modules/album.ts';
export type { ModuleInput as AlbumInput } from '../../modules/album.ts';
