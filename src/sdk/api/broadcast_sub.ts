import type { ModuleBody, ModuleInput } from '../../modules/broadcast_sub.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/broadcast_sub.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const broadcastSub: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'broadcast_sub',
  route: '/broadcast/sub',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as BroadcastSubBody } from '../../modules/broadcast_sub.ts';
export type { ModuleInput as BroadcastSubInput } from '../../modules/broadcast_sub.ts';
