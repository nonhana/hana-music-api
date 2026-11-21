import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/countries_code_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/countries_code_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const countriesCodeList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'countries_code_list',
  route: '/countries/code/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CountriesCodeListBody } from '../../modules/countries_code_list.ts';
export type { ModuleInput as CountriesCodeListInput } from '../../modules/countries_code_list.ts';
