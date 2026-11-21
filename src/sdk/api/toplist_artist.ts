import type { ModuleBody, ModuleInput } from '../../modules/toplist_artist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/toplist_artist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const toplistArtist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'toplist_artist',
  route: '/toplist/artist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ToplistArtistBody } from '../../modules/toplist_artist.ts';
export type { ModuleInput as ToplistArtistInput } from '../../modules/toplist_artist.ts';
