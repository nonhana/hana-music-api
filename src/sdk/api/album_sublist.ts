import type { ModuleBody, ModuleInput } from '../../modules/album_sublist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_sublist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumSublist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_sublist',
  route: '/album/sublist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumSublistBody } from '../../modules/album_sublist.ts';
export type { ModuleInput as AlbumSublistInput } from '../../modules/album_sublist.ts';
