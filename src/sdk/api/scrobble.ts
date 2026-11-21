import type { ModuleBody, ModuleInput } from '../../modules/scrobble.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/scrobble.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const scrobble: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'scrobble',
  route: '/scrobble',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ScrobbleBody } from '../../modules/scrobble.ts';
export type { ModuleInput as ScrobbleInput } from '../../modules/scrobble.ts';
