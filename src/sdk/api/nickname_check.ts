import type { ModuleBody, ModuleInput } from '../../modules/nickname_check.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/nickname_check.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const nicknameCheck: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'nickname_check',
  route: '/nickname/check',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as NicknameCheckBody } from '../../modules/nickname_check.ts';
export type { ModuleInput as NicknameCheckInput } from '../../modules/nickname_check.ts';
