import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/video_detail_info.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_detail_info.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoDetailInfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_detail_info',
  route: '/video/detail/info',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoDetailInfoBody } from '../../modules/video_detail_info.ts';
export type { ModuleInput as VideoDetailInfoInput } from '../../modules/video_detail_info.ts';
