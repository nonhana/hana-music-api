import type { ModuleBody, ModuleInput } from '../../modules/comment_video.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment_video.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const commentVideo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'comment_video',
  route: '/comment/video',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CommentVideoBody } from '../../modules/comment_video.ts';
export type { ModuleInput as CommentVideoInput } from '../../modules/comment_video.ts';
