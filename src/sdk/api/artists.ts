import type { ModuleBody, ModuleInput } from '../../modules/artists.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artists.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artists: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artists',
  route: '/artists',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistsBody } from '../../modules/artists.ts';
export type { ModuleInput as ArtistsInput } from '../../modules/artists.ts';
