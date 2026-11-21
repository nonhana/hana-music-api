import type { ModuleBody, ModuleInput } from '../../modules/ugc_song_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_song_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcSongGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_song_get',
  route: '/ugc/song/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcSongGetBody } from '../../modules/ugc_song_get.ts';
export type { ModuleInput as UgcSongGetInput } from '../../modules/ugc_song_get.ts';
