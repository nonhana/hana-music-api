import type { ModuleBody, ModuleInput } from '../../modules/resource_like.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/resource_like.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const resourceLike: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'resource_like',
  route: '/resource/like',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ResourceLikeBody } from '../../modules/resource_like.ts';
export type { ModuleInput as ResourceLikeInput } from '../../modules/resource_like.ts';
