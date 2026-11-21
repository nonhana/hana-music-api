import type { ModuleBody, ModuleInput } from '../../modules/mv_detail_info.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mv_detail_info.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mvDetailInfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mv_detail_info',
  route: '/mv/detail/info',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MvDetailInfoBody } from '../../modules/mv_detail_info.ts';
export type { ModuleInput as MvDetailInfoInput } from '../../modules/mv_detail_info.ts';
