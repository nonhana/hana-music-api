import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_toplist_newcomer.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_toplist_newcomer.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djToplistNewcomer: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_toplist_newcomer',
  route: '/dj/toplist/newcomer',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjToplistNewcomerBody } from '../../modules/dj_toplist_newcomer.ts';
export type { ModuleInput as DjToplistNewcomerInput } from '../../modules/dj_toplist_newcomer.ts';
