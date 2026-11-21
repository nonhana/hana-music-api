import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_sync_list_command.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_sync_list_command.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherSyncListCommand: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_sync_list_command',
  route: '/listentogether/sync/list/command',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherSyncListCommandBody } from '../../modules/listentogether_sync_list_command.ts';
export type { ModuleInput as ListentogetherSyncListCommandInput } from '../../modules/listentogether_sync_list_command.ts';
