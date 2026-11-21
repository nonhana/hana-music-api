import type { ModuleBody, ModuleInput } from '../../modules/dj_subscriber.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_subscriber.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djSubscriber: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_subscriber',
  route: '/dj/subscriber',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjSubscriberBody } from '../../modules/dj_subscriber.ts';
export type { ModuleInput as DjSubscriberInput } from '../../modules/dj_subscriber.ts';
