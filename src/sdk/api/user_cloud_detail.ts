import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/user_cloud_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_cloud_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userCloudDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_cloud_detail',
  route: '/user/cloud/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserCloudDetailBody } from '../../modules/user_cloud_detail.ts';
export type { ModuleInput as UserCloudDetailInput } from '../../modules/user_cloud_detail.ts';
