import type { ModuleBody, ModuleInput } from '../../modules/artist_new_mv.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artist_new_mv.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artistNewMv: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artist_new_mv',
  route: '/artist/new/mv',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistNewMvBody } from '../../modules/artist_new_mv.ts';
export type { ModuleInput as ArtistNewMvInput } from '../../modules/artist_new_mv.ts';
