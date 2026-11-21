import type { ModuleInput } from '../../modules/related_playlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/related_playlist.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const relatedPlaylist: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'related_playlist',
    route: '/related/playlist',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as RelatedPlaylistInput } from '../../modules/related_playlist.ts';
