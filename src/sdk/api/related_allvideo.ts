import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/related_allvideo.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/related_allvideo.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const relatedAllvideo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'related_allvideo',
  route: '/related/allvideo',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RelatedAllvideoBody } from '../../modules/related_allvideo.ts';
export type { ModuleInput as RelatedAllvideoInput } from '../../modules/related_allvideo.ts';
