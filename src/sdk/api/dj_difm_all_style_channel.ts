import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_difm_all_style_channel.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_difm_all_style_channel.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djDifmAllStyleChannel: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_difm_all_style_channel',
  route: '/dj/difm/all/style/channel',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjDifmAllStyleChannelBody } from '../../modules/dj_difm_all_style_channel.ts';
export type { ModuleInput as DjDifmAllStyleChannelInput } from '../../modules/dj_difm_all_style_channel.ts';
