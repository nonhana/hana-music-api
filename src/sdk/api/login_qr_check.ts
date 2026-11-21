import type { ModuleBody, ModuleInput } from '../../modules/login_qr_check.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login_qr_check.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const loginQrCheck: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'login_qr_check',
  route: '/login/qr/check',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LoginQrCheckBody } from '../../modules/login_qr_check.ts';
export type { ModuleInput as LoginQrCheckInput } from '../../modules/login_qr_check.ts';
