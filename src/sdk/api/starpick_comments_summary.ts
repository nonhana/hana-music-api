import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/starpick_comments_summary.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/starpick_comments_summary.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const starpickCommentsSummary: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'starpick_comments_summary',
  route: '/starpick/comments/summary',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StarpickCommentsSummaryBody } from '../../modules/starpick_comments_summary.ts';
export type { ModuleInput as StarpickCommentsSummaryInput } from '../../modules/starpick_comments_summary.ts';
