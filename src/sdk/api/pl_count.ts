import type { ModuleBody, ModuleInput } from '../../modules/pl_count.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/pl_count.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const plCount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'pl_count',
  route: '/pl/count',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlCountBody } from '../../modules/pl_count.ts';
export type { ModuleInput as PlCountInput } from '../../modules/pl_count.ts';
