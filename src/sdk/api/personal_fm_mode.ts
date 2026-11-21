import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/personal_fm_mode.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personal_fm_mode.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalFmMode: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personal_fm_mode',
  route: '/personal/fm/mode',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalFmModeBody } from '../../modules/personal_fm_mode.ts';
export type { ModuleInput as PersonalFmModeInput } from '../../modules/personal_fm_mode.ts';
