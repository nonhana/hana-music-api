import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listen_data_realtime_report.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listen_data_realtime_report.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listenDataRealtimeReport: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listen_data_realtime_report',
  route: '/listen/data/realtime/report',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListenDataRealtimeReportBody } from '../../modules/listen_data_realtime_report.ts';
export type { ModuleInput as ListenDataRealtimeReportInput } from '../../modules/listen_data_realtime_report.ts';
