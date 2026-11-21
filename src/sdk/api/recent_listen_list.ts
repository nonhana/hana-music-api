import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/recent_listen_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/recent_listen_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recentListenList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'recent_listen_list',
  route: '/recent/listen/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecentListenListBody } from '../../modules/recent_listen_list.ts';
export type { ModuleInput as RecentListenListInput } from '../../modules/recent_listen_list.ts';
