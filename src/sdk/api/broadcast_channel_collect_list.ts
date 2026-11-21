import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/broadcast_channel_collect_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/broadcast_channel_collect_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const broadcastChannelCollectList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'broadcast_channel_collect_list',
  route: '/broadcast/channel/collect/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as BroadcastChannelCollectListBody } from '../../modules/broadcast_channel_collect_list.ts';
export type { ModuleInput as BroadcastChannelCollectListInput } from '../../modules/broadcast_channel_collect_list.ts';
