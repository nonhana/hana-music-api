import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/personalized_privatecontent.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized_privatecontent.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalizedPrivatecontent: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized_privatecontent',
  route: '/personalized/privatecontent',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedPrivatecontentBody } from '../../modules/personalized_privatecontent.ts';
export type { ModuleInput as PersonalizedPrivatecontentInput } from '../../modules/personalized_privatecontent.ts';
