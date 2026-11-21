import type { ModuleBody, ModuleInput } from '../../modules/style_artist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/style_artist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const styleArtist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'style_artist',
  route: '/style/artist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StyleArtistBody } from '../../modules/style_artist.ts';
export type { ModuleInput as StyleArtistInput } from '../../modules/style_artist.ts';
