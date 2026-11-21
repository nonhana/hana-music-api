import type { ModuleInput } from '../../modules/user_cloud_del.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_cloud_del.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userCloudDel: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'user_cloud_del',
    route: '/user/cloud/del',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as UserCloudDelInput } from '../../modules/user_cloud_del.ts';
