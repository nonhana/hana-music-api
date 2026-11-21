import type { ModuleBody, ModuleInput } from '../../modules/captcha_sent.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/captcha_sent.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const captchaSent: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'captcha_sent',
  route: '/captcha/sent',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CaptchaSentBody } from '../../modules/captcha_sent.ts';
export type { ModuleInput as CaptchaSentInput } from '../../modules/captcha_sent.ts';
