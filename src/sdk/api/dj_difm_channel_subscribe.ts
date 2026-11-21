import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_difm_channel_subscribe.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_difm_channel_subscribe.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djDifmChannelSubscribe: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_difm_channel_subscribe',
  route: '/dj/difm/channel/subscribe',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjDifmChannelSubscribeBody } from '../../modules/dj_difm_channel_subscribe.ts';
export type { ModuleInput as DjDifmChannelSubscribeInput } from '../../modules/dj_difm_channel_subscribe.ts';
