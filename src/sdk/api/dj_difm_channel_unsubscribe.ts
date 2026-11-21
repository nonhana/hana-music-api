import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_difm_channel_unsubscribe.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_difm_channel_unsubscribe.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djDifmChannelUnsubscribe: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_difm_channel_unsubscribe',
  route: '/dj/difm/channel/unsubscribe',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjDifmChannelUnsubscribeBody } from '../../modules/dj_difm_channel_unsubscribe.ts';
export type { ModuleInput as DjDifmChannelUnsubscribeInput } from '../../modules/dj_difm_channel_unsubscribe.ts';
