import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/history_recommend_songs.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/history_recommend_songs.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const historyRecommendSongs: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'history_recommend_songs',
  route: '/history/recommend/songs',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as HistoryRecommendSongsBody } from '../../modules/history_recommend_songs.ts';
export type { ModuleInput as HistoryRecommendSongsInput } from '../../modules/history_recommend_songs.ts';
