import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/msg_recentcontact.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/msg_recentcontact.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const msgRecentcontact: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'msg_recentcontact',
  route: '/msg/recentcontact',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MsgRecentcontactBody } from '../../modules/msg_recentcontact.ts';
export type { ModuleInput as MsgRecentcontactInput } from '../../modules/msg_recentcontact.ts';
