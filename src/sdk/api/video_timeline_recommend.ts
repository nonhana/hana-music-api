import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/video_timeline_recommend.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_timeline_recommend.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoTimelineRecommend: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_timeline_recommend',
  route: '/video/timeline/recommend',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoTimelineRecommendBody } from '../../modules/video_timeline_recommend.ts';
export type { ModuleInput as VideoTimelineRecommendInput } from '../../modules/video_timeline_recommend.ts';
