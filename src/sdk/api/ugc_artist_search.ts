import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/ugc_artist_search.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_artist_search.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcArtistSearch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_artist_search',
  route: '/ugc/artist/search',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcArtistSearchBody } from '../../modules/ugc_artist_search.ts';
export type { ModuleInput as UgcArtistSearchInput } from '../../modules/ugc_artist_search.ts';
