import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/album_songsaleboard.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_songsaleboard.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumSongsaleboard: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_songsaleboard',
  route: '/album/songsaleboard',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumSongsaleboardBody } from '../../modules/album_songsaleboard.ts';
export type { ModuleInput as AlbumSongsaleboardInput } from '../../modules/album_songsaleboard.ts';
