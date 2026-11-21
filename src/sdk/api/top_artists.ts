import type { ModuleBody, ModuleInput } from '../../modules/top_artists.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_artists.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topArtists: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_artists',
  route: '/top/artists',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopArtistsBody } from '../../modules/top_artists.ts';
export type { ModuleInput as TopArtistsInput } from '../../modules/top_artists.ts';
