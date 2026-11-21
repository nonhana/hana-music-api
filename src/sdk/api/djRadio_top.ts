import type { ModuleBody, ModuleInput } from '../../modules/djRadio_top.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/djRadio_top.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djRadioTop: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'djRadio_top',
  route: '/djRadio/top',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjRadioTopBody } from '../../modules/djRadio_top.ts';
export type { ModuleInput as DjRadioTopInput } from '../../modules/djRadio_top.ts';
