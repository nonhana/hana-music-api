import type { ModuleBody, ModuleInput } from '../../modules/likelist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/likelist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const likelist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'likelist',
  route: '/likelist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LikelistBody } from '../../modules/likelist.ts';
export type { ModuleInput as LikelistInput } from '../../modules/likelist.ts';
