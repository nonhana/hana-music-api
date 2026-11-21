import type { ModuleBody, ModuleInput } from '../../modules/comment_new.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment_new.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const commentNew: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'comment_new',
  route: '/comment/new',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CommentNewBody } from '../../modules/comment_new.ts';
export type { ModuleInput as CommentNewInput } from '../../modules/comment_new.ts';
