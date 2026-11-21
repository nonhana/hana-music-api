import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_toplist_hours.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_toplist_hours.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djToplistHours: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_toplist_hours',
  route: '/dj/toplist/hours',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjToplistHoursBody } from '../../modules/dj_toplist_hours.ts';
export type { ModuleInput as DjToplistHoursInput } from '../../modules/dj_toplist_hours.ts';
