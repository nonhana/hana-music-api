import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_dynamic_cover.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_dynamic_cover.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songDynamicCover: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_dynamic_cover',
  route: '/song/dynamic/cover',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongDynamicCoverBody } from '../../modules/song_dynamic_cover.ts';
export type { ModuleInput as SongDynamicCoverInput } from '../../modules/song_dynamic_cover.ts';
