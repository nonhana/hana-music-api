import type { ModuleBody, ModuleInput } from '../../modules/song_red_count.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_red_count.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songRedCount: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_red_count',
  route: '/song/red/count',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongRedCountBody } from '../../modules/song_red_count.ts';
export type { ModuleInput as SongRedCountInput } from '../../modules/song_red_count.ts';
