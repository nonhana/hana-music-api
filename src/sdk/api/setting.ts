import type { ModuleBody, ModuleInput } from '../../modules/setting.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/setting.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const setting: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'setting',
  route: '/setting',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SettingBody } from '../../modules/setting.ts';
export type { ModuleInput as SettingInput } from '../../modules/setting.ts';
