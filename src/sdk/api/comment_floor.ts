import type { ModuleBody, ModuleInput } from '../../modules/comment_floor.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment_floor.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const commentFloor: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'comment_floor',
  route: '/comment/floor',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CommentFloorBody } from '../../modules/comment_floor.ts';
export type { ModuleInput as CommentFloorInput } from '../../modules/comment_floor.ts';
