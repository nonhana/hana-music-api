import type { ModuleBody, ModuleInput } from '../../modules/inner_version.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/inner_version.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const innerVersion: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'inner_version',
  route: '/inner/version',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as InnerVersionBody } from '../../modules/inner_version.ts';
export type { ModuleInput as InnerVersionInput } from '../../modules/inner_version.ts';
