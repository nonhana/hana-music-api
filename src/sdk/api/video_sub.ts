import type { ModuleBody, ModuleInput } from '../../modules/video_sub.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_sub.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoSub: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_sub',
  route: '/video/sub',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoSubBody } from '../../modules/video_sub.ts';
export type { ModuleInput as VideoSubInput } from '../../modules/video_sub.ts';
