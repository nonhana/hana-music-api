import type { ModuleBody, ModuleInput } from '../../modules/ugc_album_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_album_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcAlbumGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_album_get',
  route: '/ugc/album/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcAlbumGetBody } from '../../modules/ugc_album_get.ts';
export type { ModuleInput as UgcAlbumGetInput } from '../../modules/ugc_album_get.ts';
