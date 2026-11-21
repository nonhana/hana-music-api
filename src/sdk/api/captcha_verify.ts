import type { ModuleInput } from '../../modules/captcha_verify.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/captcha_verify.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const captchaVerify: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'captcha_verify',
    route: '/captcha/verify',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as CaptchaVerifyInput } from '../../modules/captcha_verify.ts';
