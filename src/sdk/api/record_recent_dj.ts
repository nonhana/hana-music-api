import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/record_recent_dj.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/record_recent_dj.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recordRecentDj: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'record_recent_dj',
  route: '/record/recent/dj',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecordRecentDjBody } from '../../modules/record_recent_dj.ts';
export type { ModuleInput as RecordRecentDjInput } from '../../modules/record_recent_dj.ts';
