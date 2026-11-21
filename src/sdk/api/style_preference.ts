import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/style_preference.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/style_preference.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const stylePreference: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'style_preference',
  route: '/style/preference',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StylePreferenceBody } from '../../modules/style_preference.ts';
export type { ModuleInput as StylePreferenceInput } from '../../modules/style_preference.ts';
