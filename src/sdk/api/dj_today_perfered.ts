import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_today_perfered.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_today_perfered.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djTodayPerfered: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_today_perfered',
  route: '/dj/today/perfered',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjTodayPerferedBody } from '../../modules/dj_today_perfered.ts';
export type { ModuleInput as DjTodayPerferedInput } from '../../modules/dj_today_perfered.ts';
