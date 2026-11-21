import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/broadcast_channel_currentinfo.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/broadcast_channel_currentinfo.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const broadcastChannelCurrentinfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'broadcast_channel_currentinfo',
  route: '/broadcast/channel/currentinfo',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as BroadcastChannelCurrentinfoBody } from '../../modules/broadcast_channel_currentinfo.ts';
export type { ModuleInput as BroadcastChannelCurrentinfoInput } from '../../modules/broadcast_channel_currentinfo.ts';
