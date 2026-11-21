import type { ModuleBody, ModuleInput } from '../../modules/msg_notices.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/msg_notices.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const msgNotices: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'msg_notices',
  route: '/msg/notices',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MsgNoticesBody } from '../../modules/msg_notices.ts';
export type { ModuleInput as MsgNoticesInput } from '../../modules/msg_notices.ts';
