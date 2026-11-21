import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listen_data_year_report.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listen_data_year_report.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listenDataYearReport: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listen_data_year_report',
  route: '/listen/data/year/report',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListenDataYearReportBody } from '../../modules/listen_data_year_report.ts';
export type { ModuleInput as ListenDataYearReportInput } from '../../modules/listen_data_year_report.ts';
