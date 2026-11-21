import type { ModuleBody, ModuleInput } from '../../modules/get_userids.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/get_userids.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const getUserids: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'get_userids',
  route: '/get/userids',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as GetUseridsBody } from '../../modules/get_userids.ts';
export type { ModuleInput as GetUseridsInput } from '../../modules/get_userids.ts';
