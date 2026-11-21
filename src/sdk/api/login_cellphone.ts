import type { ModuleBody, ModuleInput } from '../../modules/login_cellphone.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/login_cellphone.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const loginCellphone: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'login_cellphone',
  route: '/login/cellphone',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LoginCellphoneBody } from '../../modules/login_cellphone.ts';
export type { ModuleInput as LoginCellphoneInput } from '../../modules/login_cellphone.ts';
export { RiskBody as LoginCellphoneRiskBody } from '../../modules/login_cellphone.ts';
