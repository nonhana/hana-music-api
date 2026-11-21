import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listen_data_total.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listen_data_total.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listenDataTotal: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listen_data_total',
  route: '/listen/data/total',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListenDataTotalBody } from '../../modules/listen_data_total.ts';
export type { ModuleInput as ListenDataTotalInput } from '../../modules/listen_data_total.ts';
