import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/mv_exclusive_rcmd.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mv_exclusive_rcmd.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mvExclusiveRcmd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mv_exclusive_rcmd',
  route: '/mv/exclusive/rcmd',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MvExclusiveRcmdBody } from '../../modules/mv_exclusive_rcmd.ts';
export type { ModuleInput as MvExclusiveRcmdInput } from '../../modules/mv_exclusive_rcmd.ts';
