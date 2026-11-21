import type { ModuleBody, ModuleInput } from '../../modules/style_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/style_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const styleSong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'style_song',
  route: '/style/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as StyleSongBody } from '../../modules/style_song.ts';
export type { ModuleInput as StyleSongInput } from '../../modules/style_song.ts';
