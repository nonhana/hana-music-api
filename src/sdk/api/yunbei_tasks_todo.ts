import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/yunbei_tasks_todo.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_tasks_todo.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiTasksTodo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'yunbei_tasks_todo',
  route: '/yunbei/tasks/todo',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as YunbeiTasksTodoBody } from '../../modules/yunbei_tasks_todo.ts';
export type { ModuleInput as YunbeiTasksTodoInput } from '../../modules/yunbei_tasks_todo.ts';
