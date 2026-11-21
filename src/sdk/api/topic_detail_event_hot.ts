import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/topic_detail_event_hot.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/topic_detail_event_hot.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topicDetailEventHot: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'topic_detail_event_hot',
  route: '/topic/detail/event/hot',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopicDetailEventHotBody } from '../../modules/topic_detail_event_hot.ts';
export type { ModuleInput as TopicDetailEventHotInput } from '../../modules/topic_detail_event_hot.ts';
