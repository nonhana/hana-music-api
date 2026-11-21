import type { ModuleBody, ModuleInput } from '../../modules/album_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_list',
  route: '/album/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumListBody } from '../../modules/album_list.ts';
export type { ModuleInput as AlbumListInput } from '../../modules/album_list.ts';
