import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/personalized_newsong.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized_newsong.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalizedNewsong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized_newsong',
  route: '/personalized/newsong',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedNewsongBody } from '../../modules/personalized_newsong.ts';
export type { ModuleInput as PersonalizedNewsongInput } from '../../modules/personalized_newsong.ts';
