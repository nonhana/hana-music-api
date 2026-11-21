import type { ModuleBody, ModuleInput } from '../../modules/mv_sublist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mv_sublist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mvSublist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mv_sublist',
  route: '/mv/sublist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MvSublistBody } from '../../modules/mv_sublist.ts';
export type { ModuleInput as MvSublistInput } from '../../modules/mv_sublist.ts';
