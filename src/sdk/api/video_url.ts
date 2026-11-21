import type { ModuleBody, ModuleInput } from '../../modules/video_url.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_url.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoUrl: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_url',
  route: '/video/url',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoUrlBody } from '../../modules/video_url.ts';
export type { ModuleInput as VideoUrlInput } from '../../modules/video_url.ts';
