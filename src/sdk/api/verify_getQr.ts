import type { ModuleBody, ModuleInput } from '../../modules/verify_getQr.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/verify_getQr.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const verifyGetQr: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'verify_getQr',
  route: '/verify/getQr',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as VerifyGetQrBody } from '../../modules/verify_getQr.ts';
export type { ModuleInput as VerifyGetQrInput } from '../../modules/verify_getQr.ts';
