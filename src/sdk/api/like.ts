import type { ModuleBody, ModuleInput } from '../../modules/like.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/like.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const like: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'like',
  route: '/like',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LikeBody } from '../../modules/like.ts';
export type { ModuleInput as LikeInput } from '../../modules/like.ts';
