import type { ModuleBody, ModuleInput } from '../../modules/comment_dj.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment_dj.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const commentDj: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'comment_dj',
  route: '/comment/dj',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CommentDjBody } from '../../modules/comment_dj.ts';
export type { ModuleInput as CommentDjInput } from '../../modules/comment_dj.ts';
