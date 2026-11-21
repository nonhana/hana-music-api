import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_download_url.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_download_url.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songDownloadUrl: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_download_url',
  route: '/song/download/url',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongDownloadUrlBody } from '../../modules/song_download_url.ts';
export type { ModuleInput as SongDownloadUrlInput } from '../../modules/song_download_url.ts';
