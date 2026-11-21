import type { ModuleInput } from '../../modules/send_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/send_song.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sendSong: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'send_song',
    route: '/send/song',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as SendSongInput } from '../../modules/send_song.ts';
