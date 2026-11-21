import type { ModuleBody, ModuleInput } from '../../modules/video_group.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/video_group.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const videoGroup: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'video_group',
  route: '/video/group',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VideoGroupBody } from '../../modules/video_group.ts';
export type { ModuleInput as VideoGroupInput } from '../../modules/video_group.ts';
