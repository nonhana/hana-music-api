import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/cellphone_existence_check.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/cellphone_existence_check.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const cellphoneExistenceCheck: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'cellphone_existence_check',
  route: '/cellphone/existence/check',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CellphoneExistenceCheckBody } from '../../modules/cellphone_existence_check.ts';
export type { ModuleInput as CellphoneExistenceCheckInput } from '../../modules/cellphone_existence_check.ts';
