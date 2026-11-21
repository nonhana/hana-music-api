import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_singledownlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_singledownlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songSingledownlist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_singledownlist',
  route: '/song/singledownlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongSingledownlistBody } from '../../modules/song_singledownlist.ts';
export type { ModuleInput as SongSingledownlistInput } from '../../modules/song_singledownlist.ts';
