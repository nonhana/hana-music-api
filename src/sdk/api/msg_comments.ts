import type { ModuleBody, ModuleInput } from '../../modules/msg_comments.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/msg_comments.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const msgComments: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'msg_comments',
  route: '/msg/comments',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MsgCommentsBody } from '../../modules/msg_comments.ts';
export type { ModuleInput as MsgCommentsInput } from '../../modules/msg_comments.ts';
