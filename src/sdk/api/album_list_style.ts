import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/album_list_style.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_list_style.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumListStyle: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_list_style',
  route: '/album/list/style',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumListStyleBody } from '../../modules/album_list_style.ts';
export type { ModuleInput as AlbumListStyleInput } from '../../modules/album_list_style.ts';
