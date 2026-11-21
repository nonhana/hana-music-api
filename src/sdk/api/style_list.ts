import type { ModuleBody, ModuleInput } from '../../modules/style_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/style_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const styleList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'style_list',
  route: '/style/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StyleListBody } from '../../modules/style_list.ts';
export type { ModuleInput as StyleListInput } from '../../modules/style_list.ts';
