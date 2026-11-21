import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/personalized_privatecontent_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/personalized_privatecontent_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const personalizedPrivatecontentList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'personalized_privatecontent_list',
  route: '/personalized/privatecontent/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PersonalizedPrivatecontentListBody } from '../../modules/personalized_privatecontent_list.ts';
export type { ModuleInput as PersonalizedPrivatecontentListInput } from '../../modules/personalized_privatecontent_list.ts';
