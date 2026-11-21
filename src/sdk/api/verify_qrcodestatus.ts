import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/verify_qrcodestatus.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/verify_qrcodestatus.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const verifyQrcodestatus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'verify_qrcodestatus',
  route: '/verify/qrcodestatus',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VerifyQrcodestatusBody } from '../../modules/verify_qrcodestatus.ts';
export type { ModuleInput as VerifyQrcodestatusInput } from '../../modules/verify_qrcodestatus.ts';
