import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playlist_privacy.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playlist_privacy.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playlistPrivacy: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playlist_privacy',
  route: '/playlist/privacy',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaylistPrivacyBody } from '../../modules/playlist_privacy.ts';
export type { ModuleInput as PlaylistPrivacyInput } from '../../modules/playlist_privacy.ts';
