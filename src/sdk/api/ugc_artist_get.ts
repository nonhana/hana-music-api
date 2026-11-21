import type { ModuleBody, ModuleInput } from '../../modules/ugc_artist_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_artist_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcArtistGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_artist_get',
  route: '/ugc/artist/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcArtistGetBody } from '../../modules/ugc_artist_get.ts';
export type { ModuleInput as UgcArtistGetInput } from '../../modules/ugc_artist_get.ts';
