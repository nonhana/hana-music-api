import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/video_category_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_category_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoCategoryList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_category_list',
  route: '/video/category/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoCategoryListBody } from '../../modules/video_category_list.ts';
export type { ModuleInput as VideoCategoryListInput } from '../../modules/video_category_list.ts';
