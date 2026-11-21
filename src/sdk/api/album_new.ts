import type { ModuleBody, ModuleInput } from '../../modules/album_new.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_new.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumNew: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_new',
  route: '/album/new',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumNewBody } from '../../modules/album_new.ts';
export type { ModuleInput as AlbumNewInput } from '../../modules/album_new.ts';
