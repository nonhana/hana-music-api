import type { ModuleBody, ModuleInput } from '../../modules/user_cloud.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_cloud.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userCloud: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_cloud',
  route: '/user/cloud',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserCloudBody } from '../../modules/user_cloud.ts';
export type { ModuleInput as UserCloudInput } from '../../modules/user_cloud.ts';
