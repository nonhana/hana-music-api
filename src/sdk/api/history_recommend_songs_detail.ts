import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/history_recommend_songs_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/history_recommend_songs_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const historyRecommendSongsDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'history_recommend_songs_detail',
  route: '/history/recommend/songs/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as HistoryRecommendSongsDetailBody } from '../../modules/history_recommend_songs_detail.ts';
export type { ModuleInput as HistoryRecommendSongsDetailInput } from '../../modules/history_recommend_songs_detail.ts';
