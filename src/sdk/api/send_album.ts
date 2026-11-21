import type { ModuleInput } from '../../modules/send_album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/send_album.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sendAlbum: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'send_album',
    route: '/send/album',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as SendAlbumInput } from '../../modules/send_album.ts';
