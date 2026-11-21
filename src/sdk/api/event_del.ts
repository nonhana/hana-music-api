import type { ModuleBody, ModuleInput } from '../../modules/event_del.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/event_del.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const eventDel: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'event_del',
  route: '/event/del',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as EventDelBody } from '../../modules/event_del.ts';
export type { ModuleInput as EventDelInput } from '../../modules/event_del.ts';
