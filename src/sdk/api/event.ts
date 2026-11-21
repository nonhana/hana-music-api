import type { ModuleBody, ModuleInput } from '../../modules/event.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/event.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const event: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'event',
  route: '/event',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as EventBody } from '../../modules/event.ts';
export type { ModuleInput as EventInput } from '../../modules/event.ts';
