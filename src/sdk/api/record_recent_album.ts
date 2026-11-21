import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/record_recent_album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/record_recent_album.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const recordRecentAlbum: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'record_recent_album',
  route: '/record/recent/album',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RecordRecentAlbumBody } from '../../modules/record_recent_album.ts';
export type { ModuleInput as RecordRecentAlbumInput } from '../../modules/record_recent_album.ts';
