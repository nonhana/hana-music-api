import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/video_timeline_all.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_timeline_all.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoTimelineAll: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_timeline_all',
  route: '/video/timeline/all',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoTimelineAllBody } from '../../modules/video_timeline_all.ts';
export type { ModuleInput as VideoTimelineAllInput } from '../../modules/video_timeline_all.ts';
