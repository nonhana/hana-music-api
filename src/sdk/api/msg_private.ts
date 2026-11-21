import type { ModuleBody, ModuleInput } from '../../modules/msg_private.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/msg_private.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const msgPrivate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'msg_private',
  route: '/msg/private',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MsgPrivateBody } from '../../modules/msg_private.ts';
export type { ModuleInput as MsgPrivateInput } from '../../modules/msg_private.ts';
