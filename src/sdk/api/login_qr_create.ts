import type { ModuleBody, ModuleInput } from '../../modules/login_qr_create.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login_qr_create.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const loginQrCreate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'login_qr_create',
  route: '/login/qr/create',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LoginQrCreateBody } from '../../modules/login_qr_create.ts';
export type { ModuleInput as LoginQrCreateInput } from '../../modules/login_qr_create.ts';
