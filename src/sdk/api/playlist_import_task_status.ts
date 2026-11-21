import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_import_task_status.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_import_task_status.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistImportTaskStatus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_import_task_status',
  route: '/playlist/import/task/status',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistImportTaskStatusBody } from '../../modules/playlist_import_task_status.ts';
export type { ModuleInput as PlaylistImportTaskStatusInput } from '../../modules/playlist_import_task_status.ts';
