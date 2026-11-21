import type { ModuleBody, ModuleInput } from '../../modules/song_downlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_downlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songDownlist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_downlist',
  route: '/song/downlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongDownlistBody } from '../../modules/song_downlist.ts';
export type { ModuleInput as SongDownlistInput } from '../../modules/song_downlist.ts';
