import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/artist_follow_count.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/artist_follow_count.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const artistFollowCount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'artist_follow_count',
  route: '/artist/follow/count',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ArtistFollowCountBody } from '../../modules/artist_follow_count.ts';
export type { ModuleInput as ArtistFollowCountInput } from '../../modules/artist_follow_count.ts';
