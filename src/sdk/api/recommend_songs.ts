import type { ModuleBody, ModuleInput } from '../../modules/recommend_songs.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/recommend_songs.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recommendSongs: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'recommend_songs',
  route: '/recommend/songs',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecommendSongsBody } from '../../modules/recommend_songs.ts';
export type { ModuleInput as RecommendSongsInput } from '../../modules/recommend_songs.ts';
