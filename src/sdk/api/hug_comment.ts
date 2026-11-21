import type { ModuleInput } from '../../modules/hug_comment.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/hug_comment.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const hugComment: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'hug_comment',
    route: '/hug/comment',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as HugCommentInput } from '../../modules/hug_comment.ts';
