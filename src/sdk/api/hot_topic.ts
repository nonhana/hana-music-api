import type { ModuleBody, ModuleInput } from '../../modules/hot_topic.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/hot_topic.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const hotTopic: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'hot_topic',
  route: '/hot/topic',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as HotTopicBody } from '../../modules/hot_topic.ts';
export type { ModuleInput as HotTopicInput } from '../../modules/hot_topic.ts';
