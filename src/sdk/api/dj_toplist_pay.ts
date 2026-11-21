import type { ModuleBody, ModuleInput } from '../../modules/dj_toplist_pay.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_toplist_pay.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djToplistPay: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_toplist_pay',
  route: '/dj/toplist/pay',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjToplistPayBody } from '../../modules/dj_toplist_pay.ts';
export type { ModuleInput as DjToplistPayInput } from '../../modules/dj_toplist_pay.ts';
