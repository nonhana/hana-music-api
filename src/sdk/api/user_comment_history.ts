import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_comment_history.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_comment_history.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userCommentHistory: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_comment_history',
  route: '/user/comment/history',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserCommentHistoryBody } from '../../modules/user_comment_history.ts';
export type { ModuleInput as UserCommentHistoryInput } from '../../modules/user_comment_history.ts';
