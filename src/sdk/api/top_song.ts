import type { ModuleBody, ModuleInput } from '../../modules/top_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/top_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const topSong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'top_song',
  route: '/top/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as TopSongBody } from '../../modules/top_song.ts';
export type { ModuleInput as TopSongInput } from '../../modules/top_song.ts';
