import type { ModuleBody, ModuleInput } from '../../modules/mv_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mv_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mvDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mv_detail',
  route: '/mv/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MvDetailBody } from '../../modules/mv_detail.ts';
export type { ModuleInput as MvDetailInput } from '../../modules/mv_detail.ts';
