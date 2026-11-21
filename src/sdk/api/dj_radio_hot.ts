import type { ModuleBody, ModuleInput } from '../../modules/dj_radio_hot.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_radio_hot.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djRadioHot: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_radio_hot',
  route: '/dj/radio/hot',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjRadioHotBody } from '../../modules/dj_radio_hot.ts';
export type { ModuleInput as DjRadioHotInput } from '../../modules/dj_radio_hot.ts';
