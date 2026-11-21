import type { ModuleInput } from '../../modules/comment.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const comment: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'comment',
    route: '/comment',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as CommentInput } from '../../modules/comment.ts';
