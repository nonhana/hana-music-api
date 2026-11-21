import type { ModuleBody, ModuleInput } from '../../modules/dj_paygift.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_paygift.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djPaygift: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_paygift',
  route: '/dj/paygift',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjPaygiftBody } from '../../modules/dj_paygift.ts';
export type { ModuleInput as DjPaygiftInput } from '../../modules/dj_paygift.ts';
