import type { ModuleBody, ModuleInput } from '../../modules/toplist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/toplist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const toplist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'toplist',
  route: '/toplist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ToplistBody } from '../../modules/toplist.ts';
export type { ModuleInput as ToplistInput } from '../../modules/toplist.ts';
