import type { ModuleBody, ModuleInput } from '../../modules/mlog_to_video.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mlog_to_video.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mlogToVideo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mlog_to_video',
  route: '/mlog/to/video',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MlogToVideoBody } from '../../modules/mlog_to_video.ts';
export type { ModuleInput as MlogToVideoInput } from '../../modules/mlog_to_video.ts';
