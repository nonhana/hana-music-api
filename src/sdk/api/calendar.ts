import type { ModuleBody, ModuleInput } from '../../modules/calendar.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/calendar.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const calendar: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'calendar',
  route: '/calendar',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CalendarBody } from '../../modules/calendar.ts';
export type { ModuleInput as CalendarInput } from '../../modules/calendar.ts';
