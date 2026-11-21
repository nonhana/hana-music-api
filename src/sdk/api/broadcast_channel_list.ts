import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/broadcast_channel_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/broadcast_channel_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const broadcastChannelList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'broadcast_channel_list',
  route: '/broadcast/channel/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as BroadcastChannelListBody } from '../../modules/broadcast_channel_list.ts';
export type { ModuleInput as BroadcastChannelListInput } from '../../modules/broadcast_channel_list.ts';
