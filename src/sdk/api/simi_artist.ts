import type { ModuleBody, ModuleInput } from '../../modules/simi_artist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/simi_artist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const simiArtist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'simi_artist',
  route: '/simi/artist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SimiArtistBody } from '../../modules/simi_artist.ts';
export type { ModuleInput as SimiArtistInput } from '../../modules/simi_artist.ts';
