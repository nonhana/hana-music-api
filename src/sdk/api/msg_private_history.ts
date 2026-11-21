import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/msg_private_history.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/msg_private_history.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const msgPrivateHistory: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'msg_private_history',
  route: '/msg/private/history',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MsgPrivateHistoryBody } from '../../modules/msg_private_history.ts';
export type { ModuleInput as MsgPrivateHistoryInput } from '../../modules/msg_private_history.ts';
