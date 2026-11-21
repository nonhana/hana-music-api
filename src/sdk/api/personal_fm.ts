import type { ModuleBody, ModuleInput } from '../../modules/personal_fm.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personal_fm.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalFm: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personal_fm',
  route: '/personal_fm',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalFmBody } from '../../modules/personal_fm.ts';
export type { ModuleInput as PersonalFmInput } from '../../modules/personal_fm.ts';
