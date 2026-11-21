import type { ModuleBody, ModuleInput } from '../../modules/summary_annual.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/summary_annual.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const summaryAnnual: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'summary_annual',
  route: '/summary/annual',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SummaryAnnualBody } from '../../modules/summary_annual.ts';
export type { ModuleInput as SummaryAnnualInput } from '../../modules/summary_annual.ts';
