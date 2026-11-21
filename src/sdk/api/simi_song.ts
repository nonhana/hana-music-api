import type { ModuleBody, ModuleInput } from '../../modules/simi_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/simi_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const simiSong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'simi_song',
  route: '/simi/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SimiSongBody } from '../../modules/simi_song.ts';
export type { ModuleInput as SimiSongInput } from '../../modules/simi_song.ts';
