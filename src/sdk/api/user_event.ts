import type { ModuleBody, ModuleInput } from '../../modules/user_event.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_event.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userEvent: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_event',
  route: '/user/event',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserEventBody } from '../../modules/user_event.ts';
export type { ModuleInput as UserEventInput } from '../../modules/user_event.ts';
