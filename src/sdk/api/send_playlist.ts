import type { ModuleInput } from '../../modules/send_playlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/send_playlist.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sendPlaylist: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'send_playlist',
    route: '/send/playlist',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as SendPlaylistInput } from '../../modules/send_playlist.ts';
