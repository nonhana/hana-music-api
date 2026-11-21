import type { ModuleBody, ModuleInput } from '../../modules/song_chorus.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_chorus.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songChorus: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_chorus',
  route: '/song/chorus',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongChorusBody } from '../../modules/song_chorus.ts';
export type { ModuleInput as SongChorusInput } from '../../modules/song_chorus.ts';
