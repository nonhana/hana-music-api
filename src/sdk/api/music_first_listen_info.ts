import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/music_first_listen_info.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/music_first_listen_info.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicFirstListenInfo: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'music_first_listen_info',
  route: '/music/first/listen/info',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicFirstListenInfoBody } from '../../modules/music_first_listen_info.ts';
export type { ModuleInput as MusicFirstListenInfoInput } from '../../modules/music_first_listen_info.ts';
