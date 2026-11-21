import type { ModuleInput } from '../../modules/register_cellphone.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/register_cellphone.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const registerCellphone: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'register_cellphone',
    route: '/register/cellphone',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as RegisterCellphoneInput } from '../../modules/register_cellphone.ts';
