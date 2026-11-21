import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/recommend_songs_dislike.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/recommend_songs_dislike.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recommendSongsDislike: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'recommend_songs_dislike',
  route: '/recommend/songs/dislike',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecommendSongsDislikeBody } from '../../modules/recommend_songs_dislike.ts';
export type { ModuleInput as RecommendSongsDislikeInput } from '../../modules/recommend_songs_dislike.ts';
