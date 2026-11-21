import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_accept.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_accept.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherAccept: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_accept',
  route: '/listentogether/accept',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherAcceptBody } from '../../modules/listentogether_accept.ts';
export type { ModuleInput as ListentogetherAcceptInput } from '../../modules/listentogether_accept.ts';
