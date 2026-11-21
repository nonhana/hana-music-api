import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_status.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_status.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherStatus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_status',
  route: '/listentogether/status',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherStatusBody } from '../../modules/listentogether_status.ts';
export type { ModuleInput as ListentogetherStatusInput } from '../../modules/listentogether_status.ts';
