import type { ModuleBody, ModuleInput } from '../../modules/login_qr_key.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login_qr_key.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const loginQrKey: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'login_qr_key',
  route: '/login/qr/key',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LoginQrKeyBody } from '../../modules/login_qr_key.ts';
export type { ModuleInput as LoginQrKeyInput } from '../../modules/login_qr_key.ts';
