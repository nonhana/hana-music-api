import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/aidj_content_rcmd.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/aidj_content_rcmd.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const aidjContentRcmd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'aidj_content_rcmd',
  route: '/aidj/content/rcmd',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AidjContentRcmdBody } from '../../modules/aidj_content_rcmd.ts';
export type { ModuleInput as AidjContentRcmdInput } from '../../modules/aidj_content_rcmd.ts';
