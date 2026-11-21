import type { ModuleBody, ModuleInput } from '../../modules/album_newest.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_newest.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumNewest: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_newest',
  route: '/album/newest',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumNewestBody } from '../../modules/album_newest.ts';
export type { ModuleInput as AlbumNewestInput } from '../../modules/album_newest.ts';
