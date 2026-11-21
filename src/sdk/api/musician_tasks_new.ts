import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/musician_tasks_new.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_tasks_new.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianTasksNew: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'musician_tasks_new',
  route: '/musician/tasks/new',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicianTasksNewBody } from '../../modules/musician_tasks_new.ts';
export type { ModuleInput as MusicianTasksNewInput } from '../../modules/musician_tasks_new.ts';
