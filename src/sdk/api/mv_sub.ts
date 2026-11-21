import type { ModuleBody, ModuleInput } from '../../modules/mv_sub.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mv_sub.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mvSub: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mv_sub',
  route: '/mv/sub',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MvSubBody } from '../../modules/mv_sub.ts';
export type { ModuleInput as MvSubInput } from '../../modules/mv_sub.ts';
