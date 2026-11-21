import type { ModuleBody, ModuleInput } from '../../modules/album_sub.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_sub.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumSub: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_sub',
  route: '/album/sub',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumSubBody } from '../../modules/album_sub.ts';
export type { ModuleInput as AlbumSubInput } from '../../modules/album_sub.ts';
