import type { ModuleBody, ModuleInput } from '../../modules/sign_happy_info.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/sign_happy_info.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const signHappyInfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'sign_happy_info',
  route: '/sign/happy/info',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SignHappyInfoBody } from '../../modules/sign_happy_info.ts';
export type { ModuleInput as SignHappyInfoInput } from '../../modules/sign_happy_info.ts';
