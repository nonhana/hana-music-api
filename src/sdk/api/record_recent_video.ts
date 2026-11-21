import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/record_recent_video.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/record_recent_video.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recordRecentVideo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'record_recent_video',
  route: '/record/recent/video',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecordRecentVideoBody } from '../../modules/record_recent_video.ts';
export type { ModuleInput as RecordRecentVideoInput } from '../../modules/record_recent_video.ts';
