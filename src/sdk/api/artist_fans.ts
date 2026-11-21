import type { ModuleBody, ModuleInput } from '../../modules/artist_fans.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artist_fans.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artistFans: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artist_fans',
  route: '/artist/fans',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistFansBody } from '../../modules/artist_fans.ts';
export type { ModuleInput as ArtistFansInput } from '../../modules/artist_fans.ts';
