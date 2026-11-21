import type { ModuleBody, ModuleInput } from '../../modules/musician_tasks.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_tasks.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianTasks: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'musician_tasks',
  route: '/musician/tasks',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicianTasksBody } from '../../modules/musician_tasks.ts';
export type { ModuleInput as MusicianTasksInput } from '../../modules/musician_tasks.ts';
