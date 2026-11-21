import type { ModuleBody, ModuleInput } from '../../modules/song_url_v1.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_url_v1.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songUrlV1: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_url_v1',
  route: '/song/url/v1',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongUrlV1Body } from '../../modules/song_url_v1.ts';
export type { ModuleInput as SongUrlV1Input } from '../../modules/song_url_v1.ts';
