import type { ModuleBody, ModuleInput } from '../../modules/song_url.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_url.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songUrl: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_url',
  route: '/song/url',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongUrlBody } from '../../modules/song_url.ts';
export type { ModuleInput as SongUrlInput } from '../../modules/song_url.ts';
