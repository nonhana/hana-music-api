import type { ModuleBody, ModuleInput } from '../../modules/ugc_mv_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/ugc_mv_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const ugcMvGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'ugc_mv_get',
  route: '/ugc/mv/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UgcMvGetBody } from '../../modules/ugc_mv_get.ts';
export type { ModuleInput as UgcMvGetInput } from '../../modules/ugc_mv_get.ts';
