import type { ModuleBody, ModuleInput } from '../../modules/top_mv.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_mv.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topMv: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_mv',
  route: '/top/mv',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopMvBody } from '../../modules/top_mv.ts';
export type { ModuleInput as TopMvInput } from '../../modules/top_mv.ts';
