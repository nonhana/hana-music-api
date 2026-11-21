import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/video_group_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_group_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoGroupList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_group_list',
  route: '/video/group/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoGroupListBody } from '../../modules/video_group_list.ts';
export type { ModuleInput as VideoGroupListInput } from '../../modules/video_group_list.ts';
