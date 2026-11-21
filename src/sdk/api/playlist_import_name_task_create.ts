import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_import_name_task_create.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_import_name_task_create.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistImportNameTaskCreate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_import_name_task_create',
  route: '/playlist/import/name/task/create',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistImportNameTaskCreateBody } from '../../modules/playlist_import_name_task_create.ts';
export type { ModuleInput as PlaylistImportNameTaskCreateInput } from '../../modules/playlist_import_name_task_create.ts';
