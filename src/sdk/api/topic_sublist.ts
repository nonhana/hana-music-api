import type { ModuleBody, ModuleInput } from '../../modules/topic_sublist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/topic_sublist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topicSublist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'topic_sublist',
  route: '/topic/sublist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopicSublistBody } from '../../modules/topic_sublist.ts';
export type { ModuleInput as TopicSublistInput } from '../../modules/topic_sublist.ts';
