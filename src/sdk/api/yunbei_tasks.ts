import type { ModuleBody, ModuleInput } from '../../modules/yunbei_tasks.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_tasks.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiTasks: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'yunbei_tasks',
  route: '/yunbei/tasks',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as YunbeiTasksBody } from '../../modules/yunbei_tasks.ts';
export type { ModuleInput as YunbeiTasksInput } from '../../modules/yunbei_tasks.ts';
