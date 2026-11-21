import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_end.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_end.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherEnd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_end',
  route: '/listentogether/end',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherEndBody } from '../../modules/listentogether_end.ts';
export type { ModuleInput as ListentogetherEndInput } from '../../modules/listentogether_end.ts';
