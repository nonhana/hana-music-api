import type { ModuleBody, ModuleInput } from '../../modules/song_like_check.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_like_check.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songLikeCheck: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_like_check',
  route: '/song/like/check',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongLikeCheckBody } from '../../modules/song_like_check.ts';
export type { ModuleInput as SongLikeCheckInput } from '../../modules/song_like_check.ts';
