import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_program_toplist_hours.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_program_toplist_hours.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djProgramToplistHours: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_program_toplist_hours',
  route: '/dj/program/toplist/hours',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjProgramToplistHoursBody } from '../../modules/dj_program_toplist_hours.ts';
export type { ModuleInput as DjProgramToplistHoursInput } from '../../modules/dj_program_toplist_hours.ts';
