import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_difm_subscribe_channels_get.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_difm_subscribe_channels_get.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djDifmSubscribeChannelsGet: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_difm_subscribe_channels_get',
  route: '/dj/difm/subscribe/channels/get',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjDifmSubscribeChannelsGetBody } from '../../modules/dj_difm_subscribe_channels_get.ts';
export type { ModuleInput as DjDifmSubscribeChannelsGetInput } from '../../modules/dj_difm_subscribe_channels_get.ts';
